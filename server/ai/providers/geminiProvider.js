const { GoogleGenerativeAI } = require('@google/generative-ai');
const jsonParser = require('../utils/jsonParser');

/**
 * Gemini Provider Layer for CandidateIQ
 */

class GeminiProvider {
  constructor() {
    this.name = 'gemini';
    this.modelName = process.env.GEMINI_RESUME_MODEL || 'gemini-1.5-flash';
    this.apiKey = process.env.GEMINI_API_KEY;

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      console.warn('[GeminiProvider] GEMINI_API_KEY not configured.');
    }
  }

  isAvailable() {
    return Boolean(this.apiKey && this.genAI && this.apiKey.trim() !== '' && this.apiKey !== 'your_gemini_api_key_here');
  }

  async generateJSON(prompt, systemInstruction = '') {
    if (!this.isAvailable()) {
      throw new Error('Gemini API Provider unavailable: Missing GEMINI_API_KEY');
    }

    const candidateModels = Array.from(new Set([
      process.env.GEMINI_RESUME_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-pro'
    ].filter(Boolean)));

    let lastError = null;
    const startTime = Date.now();

    for (const modelCandidate of candidateModels) {
      try {
        console.log(`[GeminiProvider] Executing AI Request | Provider: ${this.name} | Model: ${modelCandidate}`);
        const model = this.genAI.getGenerativeModel({
          model: modelCandidate,
          generationConfig: { responseMimeType: 'application/json' },
          systemInstruction: systemInstruction || 'You are CandidateIQ AI Assistant. You MUST respond ONLY with valid JSON.'
        });

        const response = await model.generateContent(prompt);
        const latencyMs = Date.now() - startTime;
        const rawText = response.response.text();
        const parsedJson = jsonParser.parse(rawText);

        return {
          rawText,
          json: parsedJson,
          latencyMs,
          provider: this.name,
          model: modelCandidate
        };
      } catch (err) {
        console.warn(`[GeminiProvider] Model ${modelCandidate} failed: ${err.message}. Trying next candidate...`);
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini model candidates failed');
  }
}

module.exports = new GeminiProvider();
