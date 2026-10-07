/**
 * Utility for Keyword Normalization
 * 
 * Rules:
 * 1. Remove duplicates (case-insensitive deduplication while preserving clean formatting).
 * 2. Normalize whitespace.
 * 3. Remove empty values / nulls.
 * 4. Preserve technology names (e.g. React, Node.js, MongoDB, Python, REST API, JWT).
 * 5. Remove meaningless generic words.
 * 6. Keep array deterministic.
 */

const GENERIC_WORDS = new Set([
  'the', 'and', 'or', 'a', 'an', 'is', 'for', 'with', 'to', 'in', 'of', 'on', 'at', 'by', 'from',
  'as', 'it', 'that', 'this', 'be', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must'
]);

function normalizeKeywords(rawKeywords = []) {
  if (!Array.isArray(rawKeywords)) {
    if (typeof rawKeywords === 'string') {
      rawKeywords = rawKeywords.split(/[,;\n]+/);
    } else {
      return [];
    }
  }

  const seen = new Set();
  const normalized = [];

  for (const item of rawKeywords) {
    let kw = '';
    if (typeof item === 'string') {
      kw = item;
    } else if (item && typeof item === 'object') {
      kw = item.keyword || item.name || item.title || '';
    }

    kw = kw.replace(/\s+/g, ' ').trim();
    if (!kw) continue;

    const lower = kw.toLowerCase();

    // Skip purely generic stop words
    if (GENERIC_WORDS.has(lower)) continue;

    if (!seen.has(lower)) {
      seen.add(lower);
      normalized.push(kw);
    }
  }

  return normalized;
}

module.exports = {
  normalizeKeywords
};
