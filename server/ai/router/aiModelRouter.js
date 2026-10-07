const groqProvider = require('../providers/groqProvider');
const geminiProvider = require('../providers/geminiProvider');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * AI Model Router for CandidateIQ
 * Selects primary provider (Groq -> Gemini -> Fallback) based on configuration and availability.
 */

class AIModelRouter {
  selectProvider(operation = '') {
    // Resume Parser AI & Resume Keyword Extraction explicitly use Gemini when available
    if ((operation === 'resume_parse' || operation === 'resume_keyword_extraction') && geminiProvider.isAvailable()) {
      return geminiProvider;
    }

    const preferred = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

    if (preferred === 'gemini' && geminiProvider.isAvailable()) {
      return geminiProvider;
    }

    if (preferred === 'groq' && groqProvider.isAvailable()) {
      return groqProvider;
    }

    if (geminiProvider.isAvailable()) {
      return geminiProvider;
    }

    if (groqProvider.isAvailable()) {
      return groqProvider;
    }

    return fallbackProvider;
  }

  getFallbackProvider() {
    return fallbackProvider;
  }

  getSecondaryProvider(currentPrimaryName = 'gemini') {
    if (currentPrimaryName === 'gemini' && groqProvider.isAvailable()) {
      return groqProvider;
    }
    if (currentPrimaryName === 'groq' && geminiProvider.isAvailable()) {
      return geminiProvider;
    }
    return geminiProvider.isAvailable() ? geminiProvider : (groqProvider.isAvailable() ? groqProvider : null);
  }
}

module.exports = new AIModelRouter();
