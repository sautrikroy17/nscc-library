const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

async function callGroq(messages, maxTokens = 500) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });
  const data = await resp.json();
  if (!data.choices) throw new Error(data.error?.message || 'Groq API error');
  return data.choices[0].message.content;
}

// POST /api/ai/chat — Library AI assistant
router.post('/chat', authenticateToken, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Get current catalog snapshot (lightweight)
  const books = db.prepare('SELECT id, title, author, category, available_copies, total_copies, description FROM books').all();
  const catalog = books.map(b => `[${b.id}] "${b.title}" by ${b.author} (${b.category}) — ${b.available_copies}/${b.total_copies} available`).join('\n');

  const systemPrompt = `You are Alexandria, the intelligent AI librarian assistant for the NSCC SRM IST Library Management System. You help students and librarians with:
1. Book discovery and recommendations based on interests or study goals
2. Study roadmaps using books in the catalog
3. Library policy questions (14-day loan periods, ₹5/day fine for overdue, max 5 books per student)
4. Answering questions about specific books in the catalog
5. Helping students with reading plans and academic guidance

Current Library Catalog:
${catalog}

Keep responses friendly, helpful, and concise. If recommending books from the catalog, mention their Book ID. Always cite if a book is currently available or not.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message }
  ];

  try {
    const reply = await callGroq(messages, 600);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'AI assistant temporarily unavailable', details: err.message });
  }
});

// POST /api/ai/search — semantic book search with robust fallback
router.post('/search', authenticateToken, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  const books = db.prepare('SELECT id, title, author, category, available_copies, description FROM books').all();

  // ── Word-level scorer (always reliable) ──────────────────────────
  function wordScore(book, queryWords) {
    const fields = [
      { text: (book.title || '').toLowerCase(), weight: 4 },
      { text: (book.author || '').toLowerCase(), weight: 2 },
      { text: (book.category || '').toLowerCase(), weight: 3 },
      { text: (book.description || '').toLowerCase(), weight: 1 },
    ];
    let score = 0;
    for (const word of queryWords) {
      for (const field of fields) {
        if (field.text.includes(word)) score += field.weight;
        if (field.text.startsWith(word)) score += field.weight; // bonus for prefix match
      }
    }
    return score;
  }

  const stopWords = new Set(['a','an','the','and','or','for','of','in','on','to','with','is','are','by','as','at','from','about','book','books']);
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  const keywordResults = books
    .map(b => ({ ...b, _score: wordScore(b, queryWords) }))
    .filter(b => b._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8)
    .map(b => ({ ...b, match_reason: `Matches: ${queryWords.filter(w =>
      `${b.title} ${b.author} ${b.category} ${b.description || ''}`.toLowerCase().includes(w)
    ).join(', ')}` }));

  // Return keyword results immediately if strong enough or AI unavailable
  if (keywordResults.length >= 3) {
    // Also try AI in background to re-rank (non-blocking)
    const catalog = books.map(b => `${b.id}|${b.title}|${b.author}|${b.category}`).join('\n');
    const systemMsg = `You are a JSON-only book ranker. Respond ONLY with a JSON array, zero prose.
Format: [{"id":"BK001","reason":"short reason"}]`;
    const userMsg = `Query: "${query}"\n\nCatalog:\n${catalog}\n\nReturn JSON array of 5-8 most relevant IDs.`;

    try {
      const reply = await Promise.race([
        callGroq([{ role: 'system', content: systemMsg }, { role: 'user', content: userMsg }], 300),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000))
      ]);

      const start = reply.indexOf('[');
      const end = reply.lastIndexOf(']');
      if (start !== -1 && end > start) {
        const aiRanked = JSON.parse(reply.slice(start, end + 1));
        if (Array.isArray(aiRanked) && aiRanked.length > 0) {
          const enriched = aiRanked
            .map(r => {
              const book = books.find(b => b.id === r.id);
              return book ? { ...book, match_reason: r.reason || 'AI recommended' } : null;
            })
            .filter(Boolean);
          if (enriched.length > 0) return res.json({ books: enriched, query, source: 'ai' });
        }
      }
    } catch { /* fall through to keyword results */ }

    return res.json({ books: keywordResults, query, source: 'keyword' });
  }

  // Broader fallback: any single-word match
  const broadResults = books
    .map(b => ({ ...b, _score: wordScore(b, queryWords) }))
    .filter(b => b._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 6)
    .map(b => ({ ...b, match_reason: 'Partial match' }));

  res.json({ books: broadResults.length > 0 ? broadResults : keywordResults.slice(0, 5), query, source: 'keyword' });
});

// POST /api/ai/autofill — AI autofill book metadata
router.post('/autofill', authenticateToken, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Book title is required' });

  const prompt = `For the book titled "${title}", provide accurate metadata. Return ONLY a JSON object in this exact format:
{
  "title": "Exact correct book title",
  "author": "Full author name(s)",
  "isbn": "ISBN-13 if known, or empty string",
  "category": "One of: Algorithms, Software Engineering, Computer Networks, Operating Systems, Databases, AI & Machine Learning, Interview Prep, Computer Science, Computer Architecture, Web Development, Python, Competitive Programming, Mathematics, Cybersecurity",
  "published_year": 2024,
  "description": "2-3 sentence description of what this book is about and who it's for"
}`;

  try {
    const reply = await callGroq([{ role: 'user', content: prompt }], 400);
    const cleanedReply = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let metadata;
    try {
      metadata = JSON.parse(cleanedReply);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    res.json({ metadata });
  } catch (err) {
    res.status(500).json({ error: 'AI autofill unavailable', details: err.message });
  }
});

// POST /api/ai/recommend — personalized recommendations
router.post('/recommend', authenticateToken, async (req, res) => {
  const { interests, department, level = 'intermediate' } = req.body;

  const books = db.prepare('SELECT id, title, author, category, available_copies, description FROM books').all();
  const catalog = books.map(b => `[${b.id}] "${b.title}" by ${b.author} (${b.category}) — Available: ${b.available_copies > 0 ? 'Yes' : 'No'}`).join('\n');

  const prompt = `Recommend 5-6 books from this library catalog for a ${department || 'CS'} student interested in ${interests || 'software development'} at ${level} level.

Library Catalog:
${catalog}

Return a JSON array:
[{"id":"BK001","reason":"Why this book is perfect for them","priority":"must-read|recommended|bonus"}]`;

  try {
    const reply = await callGroq([{ role: 'user', content: prompt }], 400);
    const cleanedReply = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let recs;
    try { recs = JSON.parse(cleanedReply); } catch { recs = []; }

    const enriched = recs.map(r => {
      const book = books.find(b => b.id === r.id);
      return book ? { ...book, reason: r.reason, priority: r.priority } : null;
    }).filter(Boolean);

    res.json({ recommendations: enriched });
  } catch (err) {
    res.status(500).json({ error: 'AI recommendations unavailable', details: err.message });
  }
});

module.exports = router;
