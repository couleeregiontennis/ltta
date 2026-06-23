import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

console.log('Hello from Functions! (Local Ollama Version)');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid transcript in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const normalizedTranscript = transcript.trim();
    if (!normalizedTranscript || normalizedTranscript.length > 500) {
      return new Response(JSON.stringify({ error: 'Transcript must be between 1 and 500 characters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const OLLAMA_URL = Deno.env.get('LOCAL_OLLAMA_URL');
    const SECRET = Deno.env.get('LOCAL_SERVER_SECRET');

    if (!OLLAMA_URL || !SECRET) {
      return new Response(JSON.stringify({ error: 'LOCAL_OLLAMA_URL or LOCAL_SERVER_SECRET not set' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const prompt = `You are a tennis score parsing assistant. Your task is to extract information from a user's spoken transcript of a tennis match score.
  The output should be a JSON object with the following structure:
  {
    "lineNumber": number, // Optional, defaults to 1 if not specified, but try to infer from "line one", "line two" etc.
    "matchType": "singles" | "doubles", // Optional, defaults to "doubles" if not specified. Try to infer.
    "homeSet1": number,
    "awaySet1": number,
    "homeSet2": number,
    "awaySet2": number,
    "homeSet3": number | null, // Only if a third set (tie-break) is played
    "awaySet3": number | null, // Only if a third set (tie-break) is played
    "notes": string // Any additional relevant information
  }

  The score should represent the games won in each set. A match tie-break (third set) is typically played to 10 points, win by 2.
  If a score is invalid (e.g., "7-6" in a standard set when no tie-break was mentioned), try to interpret it reasonably or return null for that set.
  If a set score is not clearly mentioned, return null for its home and away values.
  If player names are mentioned, you can ignore them as they will be handled separately.

  Always respond with ONLY the JSON object. Do not include any other text or explanation.

  Transcript: "${normalizedTranscript}"`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-home-server-secret': SECRET,
      },
      body: JSON.stringify({
        model: 'gemma4:4b',
        prompt: prompt,
        format: 'json',
        stream: false,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API failed: ${response.status} ${errText}`);
    }

    const data = await response.json();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(data.response);
    } catch (parseError) {
      console.error('Error parsing Ollama response as JSON:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON response from AI', rawResponse: data.response }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    return new Response(JSON.stringify({ error: 'Failed to process transcript', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});