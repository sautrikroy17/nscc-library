// Ultra-fast Groq LPU™ AI Engine for Alexandria Neural Librarian
import { localStore } from '../data/localStore';
import { INITIAL_BOOKS } from '../data/seedData';

export function getActiveGroqKey() {
  return import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('librax_groq_key') || '';
}

export function setCustomGroqKey(key) {
  if (key && key.trim()) localStorage.setItem('librax_groq_key', key.trim());
  else localStorage.removeItem('librax_groq_key');
}

export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_MODELS = {
  SPEED: 'qwen/qwen3.8-27b',       // Ultra fast (<0.8s), high intelligence, 131k ctx
  REASONING: 'openai/gpt-oss-120b', // 120B Flagship Reasoning
  BALANCED: 'qwen/qwen3.6-27b',    // Dependable fallback
};

function getCatalogContext() {
  try {
    const listData = localStore.listBooks({ limit: 100 });
    const books = Array.isArray(listData) ? listData : (listData.books || INITIAL_BOOKS);
    return books.map(b => 
      `[${b.id}] "${b.title}" by ${b.author} | Category: ${b.category} | Avail: ${b.available_copies}/${b.total_copies ?? 5} | Shelf: ${b.shelf_location || 'Zone A'}`
    ).join('\n');
  } catch {
    return INITIAL_BOOKS.map(b => 
      `[${b.id}] "${b.title}" by ${b.author} | Category: ${b.category} | Avail: ${b.available_copies} | Shelf: ${b.shelf_location}`
    ).join('\n');
  }
}

function extractReferencedBooks(replyText) {
  try {
    const listData = localStore.listBooks({ limit: 100 });
    const books = Array.isArray(listData) ? listData : (listData.books || INITIAL_BOOKS);
    const matched = [];
    const seen = new Set();

    // Match [BK001] pattern
    const idRegex = /\[(BK\d{3})\]/gi;
    let match;
    while ((match = idRegex.exec(replyText)) !== null) {
      const id = match[1].toUpperCase();
      if (!seen.has(id)) {
        seen.add(id);
        const book = books.find(b => b.id.toUpperCase() === id);
        if (book) matched.push(book);
      }
    }

    // Also fuzzy title match if no IDs were extracted
    if (matched.length === 0) {
      for (const b of books) {
        if (replyText.toLowerCase().includes(b.title.toLowerCase()) && !seen.has(b.id)) {
          seen.add(b.id);
          matched.push(b);
          if (matched.length >= 4) break;
        }
      }
    }

    return matched;
  } catch {
    return [];
  }
}

export const groqService = {
  /**
   * Conversational completion with Groq LPUs
   */
  async chat(message, history = [], modelChoice = GROQ_MODELS.SPEED) {
    const startTime = performance.now();
    const catalog = getCatalogContext();

    const systemPrompt = `You are Alexandria, the articulate, brilliant, and friendly AI Librarian for the SRM Institute of Science and Technology (SRM IST) Central Library and Newton School Coding Club (NSCC) Library System (LibraX).

Current Real-Time Library Catalog in Stacks:
${catalog}

Library Policies & Circulation Rules:
- Standard Student Loan Duration: 14 days per checkout.
- Overdue Fine Structure: ₹5 per day per overdue book.
- Quota Allowance: Maximum 4 active circulating books simultaneously per student.
- Access Control: Campus Turnstile Entry via Digital QR Student Pass (e.g. RA2511003010052 for Sautrik Roy).
- Physical Stacks: Organized by Zone Shelves (A-101 for Algorithms, B-204 for Software Engineering, C-301 for Networks, D-401 for AI).

Your Guidelines:
1. When recommending books from our collection, ALWAYS cite their Book ID in square brackets, e.g. [BK001], [BK002], [BK006], so the interface can render live checkout cards.
2. Provide actionable academic guidance for undergraduate and graduate engineers (CSE, IT, ECE, AI & Data Science).
3. Tailor roadmaps for competitive programming, full-stack development, system design interviews, and core CS fundamentals.
4. Keep answers friendly, authoritative, well-structured (use bullet points, bold key terms, tables when comparing books).
5. State real-time copy availability from the catalog above so students know if a book is ready on the shelf right now.`;

    // Map history to OpenAI format
    const formattedHistory = history.slice(-8).map(h => ({
      role: h.role === 'ai' || h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    const modelsToTry = [modelChoice, GROQ_MODELS.SPEED, GROQ_MODELS.REASONING, GROQ_MODELS.BALANCED];
    // De-duplicate model list
    const uniqueModels = [...new Set(modelsToTry)];

    const apiKey = getActiveGroqKey();
    if (!apiKey) throw new Error('Groq API key is not configured');

    let lastError = null;
    for (const model of uniqueModels) {
      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: model === GROQ_MODELS.REASONING ? 1000 : 800,
            temperature: 0.65
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Groq HTTP ${response.status}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        let reply = choice?.message?.content || '';

        // If reasoning model put response into reasoning, fallback to reasoning text
        if (!reply.trim() && choice?.message?.reasoning) {
          reply = choice.message.reasoning;
        }

        if (reply.trim()) {
          const latencyMs = Math.round(performance.now() - startTime);
          const referencedBooks = extractReferencedBooks(reply);

          return {
            reply: reply.trim(),
            books: referencedBooks,
            model,
            latencyMs,
            tokens: data.usage?.total_tokens || 0
          };
        }
      } catch (err) {
        console.warn(`Groq model ${model} failed, attempting next model:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('All Groq inference models were unreachable');
  },

  /**
   * Semantic book search using Groq LLM
   */
  async search(query) {
    const catalog = getCatalogContext();
    const systemMsg = `You are a semantic book matching engine for SRM IST Central Library. 
Given a student's search query (which may describe a concept, problem, or topic), select the 4-6 most relevant books from this catalog:
${catalog}

Return ONLY a valid JSON array of objects with "id" and "reason", for example:
[{"id": "BK001", "reason": "Covers dynamic programming and graph algorithms required for your topic"}]`;

    const apiKey = getActiveGroqKey();
    if (!apiKey) return { books: localStore.aiSearch(query).results || [], source: 'local' };

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: GROQ_MODELS.SPEED,
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: `Query: "${query}"` }
          ],
          max_tokens: 400,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']');
        if (start !== -1 && end > start) {
          const parsed = JSON.parse(content.substring(start, end + 1));
          const listData = localStore.listBooks({ limit: 100 });
          const allBooks = Array.isArray(listData) ? listData : (listData.books || INITIAL_BOOKS);

          const matched = parsed.map(item => {
            const b = allBooks.find(book => book.id.toUpperCase() === item.id?.toUpperCase());
            return b ? { ...b, match_reason: item.reason || 'AI Semantic Match' } : null;
          }).filter(Boolean);

          if (matched.length > 0) return { books: matched, source: 'groq' };
        }
      }
    } catch (err) {
      console.warn('Groq semantic search fallback to local search:', err);
    }

    // Fallback to local keyword search
    const localRes = localStore.aiSearch(query);
    return { books: localRes.results || [], source: 'local' };
  }
};
