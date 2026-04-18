# Local AI Server Setup for LTTA (Ollama + Vulkan)

This document outlines the architecture and deployment steps for replacing Vertex AI/Gemini endpoints with a self-hosted, local AI server using Ollama and Cloudflare Tunnels for the Coulee Region Tennis Association (LTTA) app.

## 1. Architecture Overview

-   **Hardware:** Linux server with an FX 8320 (no AVX2), 14GB DDR3 RAM, and an RX 5600 XT 6GB GDDR6 GPU.
-   **AI Engine:** [Ollama](https://ollama.com/) running with the **Vulkan** backend to bypass the CPU's lack of AVX2 instructions and offload inference to the AMD GPU.
-   **Models:**
    -   `gemma4:4b` or `phi4-mini` (or similar modern 3B-4B parameter model) for JSON score parsing (`parse-score`) and RAG Q&A (`ask-umpire`). These models are best-in-class for structured output and reasoning in the sub-4B category as of mid-2026, and must fit entirely within the 6GB VRAM.
    -   `nomic-embed-text` for generating embeddings to replace Gemini's `text-embedding-004` for Qdrant searches.
-   **Networking:** [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) (`cloudflared`) to expose the local Ollama API securely to the internet without opening inbound ports on the home router.
-   **Security:** Supabase Edge Functions act as the gatekeeper. The mobile app authenticates with Supabase, and the Edge Function forwards the request to the Cloudflare Tunnel URL, appending a secret header (`x-home-server-secret`) that the home server verifies.

## 2. Server Setup (Linux)

### 2.1. Install GPU Drivers & Vulkan
Ensure the AMD graphics drivers and Vulkan support are installed.
```bash
# For Debian/Ubuntu-based systems:
sudo apt update
sudo apt install -y mesa-vulkan-drivers vulkan-tools
# Verify Vulkan detects the RX 5600 XT:
vulkaninfo | grep -i deviceName
```

### 2.2. Install Ollama
Download the standard Linux install script.
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.3. Configure Ollama for Vulkan and Network Access
By default, Ollama only listens on `localhost`. We need it to listen on `0.0.0.0` to receive traffic from the Cloudflare Tunnel, and we need to force the Vulkan backend.

Edit the systemd service file:
```bash
sudo systemctl edit ollama.service
```
Add the following lines:
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_VULKAN=1"
# Optional: Force it to not use AVX (though Vulkan should bypass it anyway)
Environment="OLLAMA_NOPREREQ=1"
```
Restart the service:
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### 2.4. Download Models
Pull the required models into the local cache.
```bash
ollama run gemma4:4b
ollama run nomic-embed-text
```

## 3. Networking Setup (Cloudflare Tunnel)

1.  **Create a Tunnel:** Go to the Cloudflare Zero Trust dashboard -> Networks -> Tunnels. Create a new tunnel.
2.  **Install `cloudflared`:** Follow the instructions provided in the dashboard to install the connector on your Linux server.
3.  **Route Traffic:** Configure a Public Hostname (e.g., `ollama.yourdomain.com`). Set the service to route traffic to `http://localhost:11434` (Ollama's default port).
4.  **Add Security Header (Crucial):** In the Cloudflare Tunnel configuration, under "Additional application settings" -> "HTTP Headers", add a custom request header:
    -   Name: `x-home-server-secret`
    -   Value: `[GENERATE_A_LONG_SECURE_RANDOM_STRING_HERE]`
    *(Note: Alternatively, you can have the Supabase Edge function send this header, and configure your local server/reverse proxy to reject requests without it. Cloudflare Access rules are another option for restricting access to only the Supabase IPs).*

## 4. Supabase Edge Function Updates

You will need to update both `supabase/functions/parse-score/index.ts` and `supabase/functions/ask-umpire/index.ts`.

### 4.1. Environment Variables
In your Supabase project settings, update or add the following secrets:
-   `LOCAL_OLLAMA_URL`: e.g., `https://ollama.yourdomain.com`
-   `LOCAL_SERVER_SECRET`: The secret string configured in step 3.4.

### 4.2. Example Update: `parse-score`
Instead of using the Google Generative AI SDK, make standard `fetch` requests to your Ollama endpoint, utilizing the native JSON format flag.

```typescript
// Inside parse-score/index.ts
const OLLAMA_URL = Deno.env.get('LOCAL_OLLAMA_URL');
const SECRET = Deno.env.get('LOCAL_SERVER_SECRET');

const response = await fetch(`${OLLAMA_URL}/api/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-home-server-secret': SECRET, // Send the secret header
  },
  body: JSON.stringify({
    model: 'gemma4:4b',
    prompt: `You are a tennis score parsing assistant... [YOUR EXISTING PROMPT] ... Transcript: "${transcript}"`,
    format: 'json', // Force JSON output
    stream: false,
  }),
});

const data = await response.json();
const parsedResponse = JSON.parse(data.response); // Ollama returns the text in the 'response' field
// ... return parsedResponse
```

### 4.3. Example Update: `ask-umpire`
You will need to update both the embedding generation and the chat generation.

```typescript
// Inside ask-umpire/index.ts
const OLLAMA_URL = Deno.env.get('LOCAL_OLLAMA_URL');
const SECRET = Deno.env.get('LOCAL_SERVER_SECRET');

// 1. Generate Embedding
const embedResponse = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-home-server-secret': SECRET
    },
    body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: query
    })
});
const embedData = await embedResponse.json();
const vector = embedData.embedding;

// ... 2. Search Qdrant using the vector ...

// 3. Generate Answer
const chatResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-home-server-secret': SECRET
    },
    body: JSON.stringify({
        model: 'gemma4:4b',
        prompt: `... [YOUR EXISTING UMP PROMPT] ... Context: ${context} Question: ${query}`,
        stream: false
    })
});
const chatData = await chatResponse.json();
const responseText = chatData.response;
// ... return responseText
```

## 5. Verification Steps

1.  **Local Test:** On the server, run `curl http://localhost:11434/api/tags` to ensure Ollama is running and models are loaded.
2.  **Vulkan Verification:** Monitor `htop` or `nvtop`/`radeontop` while generating text to ensure the CPU isn't maxing out and the GPU is doing the work.
3.  **Tunnel Test:** Hit your public Cloudflare URL (`https://ollama.yourdomain.com/api/tags`) from an external network *with* the required secret header to ensure it routes correctly.
4.  **End-to-End Test:** Run the LTTA app locally or deploy the updated Edge Functions to staging and test the "Add Score via Voice" and "Ask the Umpire" features.