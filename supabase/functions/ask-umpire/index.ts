import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { QdrantClient } from "https://esm.sh/@qdrant/js-client-rest@1.7.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Query is required, must be a string, and under 500 characters.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const OLLAMA_URL = Deno.env.get('LOCAL_OLLAMA_URL');
    const SECRET = Deno.env.get('LOCAL_SERVER_SECRET');
    const QDRANT_URL = Deno.env.get('QDRANT_URL');
    const QDRANT_API_KEY = Deno.env.get('QDRANT_API_KEY');

    if (!OLLAMA_URL || !SECRET || !QDRANT_URL) {
      throw new Error('Configuration missing: LOCAL_OLLAMA_URL, LOCAL_SERVER_SECRET, or QDRANT_URL')
    }

    // 1. Generate Embedding
    console.log("Generating embedding (Ollama)...");
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

    if (!embedResponse.ok) {
        const errText = await embedResponse.text();
        throw new Error(`Embedding API failed: ${embedResponse.status} ${errText}`);
    }
    
    const embedData = await embedResponse.json();
    const vector = embedData.embedding;
    
    // 2. Search Qdrant
    console.log("Searching Qdrant...");
    const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY })
    const searchResult = await qdrant.search('rules_context', {
      vector: vector,
      limit: 5, 
      score_threshold: 0.6
    })
    console.log("Qdrant search complete. Found matches:", searchResult.length);

    const context = searchResult.map(item => item.payload?.content).join('\n\n')

    // 3. Generate Answer
    console.log("Generating answer with Ollama...");
    const prompt = `
      You are the official Umpire for the Coulee Region Tennis Association (LTTA).
      Answer the player's question strictly based on the provided rules context below.
      The context may include local league rules and USTA "Friend at Court" snippets.
      Be concise and friendly.
      If the answer is not in the context, say "I don't see a specific rule for that, please check with your captain or the coordinator."
      
      Context:
      ${context || "No relevant rules found."} 

      Question: ${query}
    `;

    const chatResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-home-server-secret': SECRET
        },
        body: JSON.stringify({
            model: 'gemma4:4b',
            prompt: prompt,
            stream: false
        })
    });

    if (!chatResponse.ok) {
        const errText = await chatResponse.text();
        throw new Error(`Chat API failed: ${chatResponse.status} ${errText}`);
    }

    const chatData = await chatResponse.json();
    const responseText = chatData.response;

    return new Response(
      JSON.stringify({ answer: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})