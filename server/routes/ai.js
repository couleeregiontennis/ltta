import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/parse-score', requireAuth, async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid transcript in request body' });
    }

    const normalizedTranscript = transcript.trim();
    if (!normalizedTranscript || normalizedTranscript.length > 500) {
      return res.status(400).json({ error: 'Transcript must be between 1 and 500 characters' });
    }

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'gemma2:2b',
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
      return res.status(500).json({ error: 'Invalid JSON response from AI', rawResponse: data.response });
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ error: 'Failed to process transcript', details: error.message });
  }
});

router.post('/ask-umpire', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const QDRANT_URL = process.env.QDRANT_URL;
    const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

    if (!QDRANT_URL || !QDRANT_API_KEY) {
      return res.status(500).json({ error: 'Qdrant environment variables not configured' });
    }

    // 1. Generate embedding via Ollama
    const embedRes = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: query
      })
    });
    
    if (!embedRes.ok) throw new Error('Failed to generate embedding');
    const embedData = await embedRes.json();
    const embedding = embedData.embedding;

    // 2. Search Qdrant for relevant rules
    const qdrantRes = await fetch(`${QDRANT_URL}/collections/tennis_rules/points/search`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'api-key': QDRANT_API_KEY
      },
      body: JSON.stringify({
        vector: embedding,
        limit: 3,
        with_payload: true
      })
    });
    
    if (!qdrantRes.ok) throw new Error('Failed to query Qdrant');
    const qdrantData = await qdrantRes.json();
    
    const context = qdrantData.result.map(hit => hit.payload.text).join('\\n\\n');

    // 3. Generate answer via Ollama chat
    const chatRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'gemma2:2b',
        prompt: `You are an expert tennis umpire. Answer the following user question based strictly on the provided context rules. If the context does not contain the answer, say you don't know.\\n\\nContext:\\n${context}\\n\\nQuestion: ${query}\\n\\nAnswer:`,
        stream: false
      })
    });

    if (!chatRes.ok) throw new Error('Failed to generate answer from Ollama');
    const chatData = await chatRes.json();

    res.json({ answer: chatData.response, contextUsed: context });
  } catch (error) {
    console.error('Error asking umpire:', error);
    res.status(500).json({ error: 'Failed to process question', details: error.message });
  }
});

export default router;
