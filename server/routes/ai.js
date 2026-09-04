import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { db, ensureRulesIndexed, genUUID } from '../db.js';
import { llmQueue } from '../llmQueue.js';
import { curatedFaqs } from '../data/curatedFaqs.js';

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

    const logQuery = (matchedFaq, matchedRule, finalAnswer) => {
      try {
        db.prepare(`
          INSERT INTO umpire_queries (id, query, matched_faq, matched_rule, answer)
          VALUES (?, ?, ?, ?, ?)
        `).run(genUUID(), normalized, matchedFaq ? 1 : 0, matchedRule ? 1 : 0, finalAnswer);
      } catch (logErr) {
        console.warn('Failed to log umpire query:', logErr.message);
      }
    };

    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'the', 'and', 'with', 'from', 'for', 'about', 'does', 'did',
      'happens', 'happen', 'can', 'could', 'should', 'would', 'is', 'are', 'was',
      'were', 'tennis', 'rule', 'rules', 'please', 'tell', 'explain', 'how', 'why'
    ]);

    // Safety Gate: Refuse clinical/medical advice requests (prevent dangerous hallucinations)
    const medicalKeywords = [
      'treat', 'treatment', 'medicine', 'medication', 'cure', 'remedy', 'first aid',
      'symptom', 'diagnosis', 'heat stroke', 'heatstroke', 'heart attack', 'cpr',
      'ambulance', 'hospital', 'doctor', 'concussion', 'fracture', 'sprain'
    ];
    const queryLower = normalized.toLowerCase();
    const isMedicalQuery = medicalKeywords.some(kw => queryLower.includes(kw));
    if (isMedicalQuery) {
      const medicalFallback = "The Umpire only answers tennis and league rules questions. For medical symptoms or heat emergencies, please seek medical assistance or emergency care immediately.";
      logQuery(false, false, medicalFallback);
      return res.json({
        answer: medicalFallback,
        directHit: false,
        confidence: 'medical_refusal'
      });
    }

    const searchTerms = normalized
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // STEP 1: Direct FAQ Intent Matching (0ms latency, zero LLM load, prevents keyword bleed)
    const rawTokens = new Set(
      normalized
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2)
    );

    let bestFaq = null;
    let maxOverlap = 0;

    for (const faq of curatedFaqs) {
      const targetTokens = new Set(
        (faq.keywords + ' ' + faq.question)
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 2)
      );

      let matches = 0;
      for (const token of searchTerms) {
        if (targetTokens.has(token)) matches++;
      }

      const score = matches / Math.max(1, searchTerms.length);
      if (score > maxOverlap && score >= 0.5) {
        maxOverlap = score;
        bestFaq = faq;
      }
    }

    if (bestFaq) {
      logQuery(true, false, bestFaq.answer);
      return res.json({
        answer: bestFaq.answer,
        source: 'FAQ',
        questionMatched: bestFaq.question,
        directHit: true
      });
    }

    // STEP 2: Confidence Gate - Micro-chunk Rules FTS5 Search
    // Sort by priority DESC (local LTTA rules = 10, national USTA rules = 1), then rank
    let context = '';
    let hasRuleMatch = false;

    if (searchTerms.length > 0) {
      const matchQuery = searchTerms.map(term => `"${term}"*`).join(' OR ');
      try {
        const rows = db.prepare(`
          SELECT content, source, priority, rank
          FROM rules_fts
          WHERE rules_fts MATCH ?
          ORDER BY CAST(priority AS INTEGER) DESC, rank ASC
          LIMIT 10
        `).all(matchQuery);

        // Confidence Gate: Require at least rank < -3.5 AND meaningful keyword overlap
        // Prevents matching a completely unrelated snippet that only contains 1 random common word
        const minTermsNeeded = searchTerms.length <= 1 ? 1 : Math.min(2, searchTerms.length);
        const validRows = (rows || []).filter(r => {
          if (r.rank >= -3.5) return false;
          const snippetLower = r.content.toLowerCase();
          const matchedCount = searchTerms.filter(term => snippetLower.includes(term)).length;
          return matchedCount >= minTermsNeeded;
        });

        if (validRows.length > 0) {
          hasRuleMatch = true;
          context = validRows.slice(0, 3).map(r => r.content).join('\n');
          if (context.length > 700) {
            context = context.slice(0, 700);
          }
        }
      } catch (searchErr) {
        console.warn('FTS5 search fallback:', searchErr.message);
      }
    }

    // If no relevant rule was found in the handbooks, refuse to speculate immediately
    if (!hasRuleMatch || !context) {
      const safeFallback = "I couldn't find a specific rule covering that in the LTTA handbook or USTA regulations. Please consult your team captain or League Coordinator Brett Meddaugh.";
      logQuery(false, false, safeFallback);
      return res.json({
        answer: safeFallback,
        directHit: false,
        confidence: 'unmatched'
      });
    }

    // STEP 3: Queue AI generation with Strict Refusal Prompt
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:0.8b';

    const systemPrompt = `You are the official LTTA (La Crosse Team Tennis Association) rules assistant.
Official Rules Excerpts:
${context}

Question: ${normalized}
Instructions: Answer directly and accurately in 1 or 2 sentences using ONLY the Official Rules Excerpts above. If the excerpts do not explicitly contain the answer, reply EXACTLY: "I don't have a specific rule for that in the LTTA handbook. Please consult your team captain or League Coordinator Brett Meddaugh." Do NOT extrapolate, speculate, or guess.
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
              temperature: 0.0
            }
          })
        });

        if (!chatRes.ok) {
          const errText = await chatRes.text();
          throw new Error(`Ollama generation failed: ${chatRes.status} ${errText}`);
        }

        const chatData = await chatRes.json();
        const rawResponse = chatData.response?.trim();
        return rawResponse || "I couldn't find an answer to that question.";
      } finally {
        clearTimeout(timeout);
      }
    });

    logQuery(false, true, answer);
    res.json({ answer, contextUsed: context, directHit: false });
  } catch (error) {
    console.error('Error asking umpire:', error);
    res.status(500).json({ error: 'Failed to process question', details: error.message });
  }
});

export default router;
