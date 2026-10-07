const aiModelRouter = require('../router/aiModelRouter');
const fallbackProvider = require('../providers/fallbackProvider');
const aiLogger = require('../utils/aiLogger');

/**
 * AI Orchestrator for CandidateIQ
 * Manages request routing, prompt execution, schema validation, retries, logging, and universal envelope wrap.
 */

class AIOrchestrator {
  async executeOperation({ operation, prompt, schema, fallbackFn, metadata = {} }) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const startTime = Date.now();
    let attempt = 1;
    let primaryProvider = aiModelRouter.selectProvider(operation);
    let fallbackUsed = false;
    let result = null;
    let providerName = primaryProvider.name;
    let modelName = primaryProvider.modelName;

    try {
      // 1. Primary AI Provider Attempt
      if (primaryProvider.isAvailable() && prompt) {
        try {
          const providerRes = await primaryProvider.generateJSON(prompt);
          providerName = providerRes.provider;
          modelName = providerRes.model;

          if (schema) {
            result = schema.parse(providerRes.json);
          } else {
            result = providerRes.json;
          }
        } catch (primaryErr) {
          console.warn(`[AIOrchestrator] Primary provider (${primaryProvider.name}) failed on operation "${operation}". Error: ${primaryErr.message}. Triggering secondary AI failover...`);
          attempt = 2;
        }
      }

      // 2. Secondary AI Provider Failover (Another real AI model executes the prompt)
      if (!result && prompt) {
        const secondaryProvider = aiModelRouter.getSecondaryProvider(primaryProvider.name);
        if (secondaryProvider && secondaryProvider.isAvailable()) {
          try {
            console.log(`[AIOrchestrator] Executing failover on Secondary AI Provider: ${secondaryProvider.name}`);
            const secRes = await secondaryProvider.generateJSON(prompt);
            providerName = secRes.provider;
            modelName = secRes.model;
            fallbackUsed = true;

            if (schema) {
              result = schema.parse(secRes.json);
            } else {
              result = secRes.json;
            }
          } catch (secErr) {
            console.warn(`[AIOrchestrator] Secondary AI provider (${secondaryProvider.name}) failed on operation "${operation}". Error: ${secErr.message}`);
          }
        }
      }

      // 3. Optional fallback function ONLY if AI providers were unable to return a result
      if (!result && fallbackFn) {
        fallbackUsed = true;
        providerName = 'fallback';
        modelName = fallbackProvider.modelName;
        const rawFallback = await fallbackFn();

        if (schema) {
          result = schema.parse(rawFallback);
        } else {
          result = rawFallback;
        }
      }

      if (!result) {
        throw new Error(`AI generation failed for operation "${operation}": Primary and secondary AI models were unable to generate schema-compliant output.`);
      }

      const processingTimeMs = Date.now() - startTime;

      aiLogger.log({
        requestId,
        operation,
        provider: providerName,
        model: modelName,
        attempt,
        latencyMs: processingTimeMs,
        fallbackUsed,
        status: 'success'
      });

      return {
        requestId,
        operation,
        status: 'success',
        provider: providerName,
        model: modelName,
        attempt,
        fallbackUsed,
        processingTimeMs,
        result,
        error: null,
        metadata
      };

    } catch (error) {
      const processingTimeMs = Date.now() - startTime;

      aiLogger.log({
        requestId,
        operation,
        provider: providerName,
        model: modelName,
        attempt,
        latencyMs: processingTimeMs,
        fallbackUsed,
        status: 'failed',
        error
      });

      return {
        requestId,
        operation,
        status: 'failed',
        provider: providerName,
        model: modelName,
        attempt,
        fallbackUsed,
        processingTimeMs,
        result: null,
        error: {
          code: 'AI_PROCESSING_ERROR',
          message: error.message || 'AI processing failed.'
        },
        metadata
      };
    }
  }
}

module.exports = new AIOrchestrator();
