/**
 * JSON Parsing and Repair Utilities for CandidateIQ AI Layer
 * Ensures AI outputs clean, valid JSON even when wrapped in markdown, containing <think> tags, or unescaped newlines.
 */

const jsonParser = {
  /**
   * Extract and parse JSON from raw text response
   */
  parse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Invalid input: rawText must be a non-empty string');
    }

    // 1. Strip reasoning/thinking tags (e.g. <think>...</think>)
    let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 2. Strip markdown code fences if present
    cleaned = cleaned
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // 3. Locate first '{' or '[' and last '}' or ']'
    const firstBrace = cleaned.search(/[\{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 4. Direct JSON parse
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      // 5. Attempt repair if direct parse fails
      return jsonParser.repair(cleaned);
    }
  },

  /**
   * Attempt robust JSON repair for LLM formatting quirks
   */
  repair(jsonString) {
    let repaired = jsonString;

    // Sanitize control characters
    repaired = repaired.replace(/[\u0000-\u001F]+/g, ' ');

    // Remove trailing commas in objects and arrays
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

    // Fix unquoted keys if necessary
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    try {
      return JSON.parse(repaired);
    } catch (err) {
      // Attempt auto-closing truncated JSON string
      try {
        let fixed = repaired.trim();
        // If string ends inside an open quote, close quote
        const quoteCount = (fixed.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          fixed += '"';
        }
        // Balance brackets
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;

        for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) fixed += '}';

        return JSON.parse(fixed);
      } catch (finalErr) {
        console.error('[JSON Parser] Failed to repair malformed JSON:', finalErr.message);
        throw new Error(`JSON parsing failed: ${err.message}`);
      }
    }
  }
};

module.exports = jsonParser;
