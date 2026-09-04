import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { db, ensureRulesIndexed } from '../db.js';
import { llmQueue } from '../llmQueue.js';

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

    // Process via concurrency queue to avoid CPU thrashing
    const parsedResponse = await llmQueue.run(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'qwen3.5:0.8b',
            prompt: prompt,
            format: 'json',
            stream: false,
            think: false,
            keep_alive: '10m',
            options: {
              num_predict: 120,
              temperature: 0.1
            }
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama API failed: ${response.status} ${errText}`);
        }

        const data = await response.json();
        return JSON.parse(data.response);
      } finally {
        clearTimeout(timeout);
      }
    });

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ error: 'Failed to process transcript', details: error.message });
  }
});

router.post('/ask-umpire', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    ensureRulesIndexed();

    const normalized = query.trim();
    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'the', 'and', 'with', 'from', 'for', 'about', 'does', 'did',
      'happens', 'happen', 'can', 'could', 'should', 'would', 'is', 'are', 'was',
      'were', 'tennis', 'rule', 'rules', 'please', 'tell', 'explain'
    ]);

    const searchTerms = normalized
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // STEP 1: Fast direct FAQ Match (0ms latency, zero LLM load)
    if (searchTerms.length > 0) {
      try {
        const faqMatchQuery = searchTerms.map(t => `"${t}"*`).join(' OR ');
        const faqHits = db.prepare(`
          SELECT question, answer, rank
          FROM rules_faq_fts
          WHERE rules_faq_fts MATCH ?
          ORDER BY rank
          LIMIT 1
        `).all(faqMatchQuery);

        // Friendly threshold: any clear match (rank < -3.0) gives an immediate authoritative answer
        if (faqHits && faqHits.length > 0 && faqHits[0].rank < -3.0) {
          return res.json({
            answer: faqHits[0].answer,
            source: 'FAQ',
            questionMatched: faqHits[0].question,
            directHit: true
          });
        }
      } catch (faqErr) {
        console.warn('FAQ lookup skipped:', faqErr.message);
      }
    }

    // STEP 2: Micro-chunk Rules FTS5 Search
    // Sort by priority DESC (local LTTA rules = 10, national USTA rules = 1), then rank
    let context = '';
    if (searchTerms.length > 0) {
      const matchQuery = searchTerms.map(term => `"${term}"*`).join(' OR ');
      try {
        const rows = db.prepare(`
          SELECT content, source, priority, rank
          FROM rules_fts
          WHERE rules_fts MATCH ?
          ORDER BY CAST(priority AS INTEGER) DESC, rank ASC
          LIMIT 2
        `).all(matchQuery);

        if (rows && rows.length > 0) {
          context = rows.map(r => r.content).join('\n');
          // Bound context length strictly
          if (context.length > 600) {
            context = context.slice(0, 600);
          }
        }
      } catch (searchErr) {
        console.warn('FTS5 search fallback:', searchErr.message);
      }
    }

    // STEP 3: Queue AI generation (serialized to protect CPU, tiny prompt, max 80 tokens out)
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:0.8b';

    const systemPrompt = `You are the official LTTA (La Crosse Team Tennis Association) umpire.
${context ? `Official League Context:\n${context}\n` : ''}
Question: ${normalized}
Instructions: Answer directly and accurately in 1 or 2 sentences based strictly on the Official League Context. Do NOT provide medical diagnosis or advice.
Answer:`;

    const answer = await llmQueue.run(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const chatRes = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: systemPrompt,
            stream: false,
            think: false,
            keep_alive: '10m',
            options: {
              num_predict: 80,
              temperature: 0.1
            }
          })
        });

        if (!chatRes.ok) {
          const errText = await chatRes.text();
          throw new Error(`Ollama generation failed: ${chatRes.status} ${errText}`);
        }

        const chatData = await chatRes.json();
        return chatData.response?.trim() || "I couldn't find an answer to that question.";
      } finally {
        clearTimeout(timeout);
      }
    });

    res.json({ answer, contextUsed: context, directHit: false });
  } catch (error) {
    console.error('Error asking umpire:', error);
    res.status(500).json({ error: 'Failed to process question', details: error.message });
  }
});

export default router;
