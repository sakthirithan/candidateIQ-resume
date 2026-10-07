/**
 * AI Execution Logger for CandidateIQ
 * Records AI operation metrics, latency, attempts, fallback usage, and status without exposing PII.
 */

const aiLogger = {
  log(entry) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      requestId: entry.requestId || `req_${Date.now()}`,
      operation: entry.operation || 'unknown',
      provider: entry.provider || 'unknown',
      model: entry.model || 'unknown',
      attempt: entry.attempt || 1,
      latencyMs: entry.latencyMs || 0,
      fallbackUsed: Boolean(entry.fallbackUsed),
      status: entry.status || 'unknown',
      error: entry.error ? entry.error.message || entry.error : null
    };

    if (entry.status === 'success') {
      console.log(`[AI SUCCESS] [${logData.operation}] provider=${logData.provider} latency=${logData.latencyMs}ms fallback=${logData.fallbackUsed}`);
    } else {
      console.error(`[AI FAILURE] [${logData.operation}] provider=${logData.provider} attempt=${logData.attempt} error="${logData.error}"`);
    }

    return logData;
  }
};

module.exports = aiLogger;
