const EventEmitter = require('events');

class GenerationProgressEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
    this.activeProgress = new Map();
  }

  updateProgress(mockInterviewId, progressPayload) {
    const current = this.activeProgress.get(mockInterviewId) || {
      mockInterviewId,
      completedStages: []
    };

    const completedStages = current.completedStages || [];
    if (progressPayload.stage && !completedStages.includes(progressPayload.stage) && progressPayload.stage !== 'FAILED') {
      completedStages.push(progressPayload.stage);
    }

    const payload = {
      mockInterviewId,
      ...progressPayload,
      completedStages,
      timestamp: new Date().toISOString()
    };

    this.activeProgress.set(mockInterviewId, payload);
    this.emit(`progress:${mockInterviewId}`, payload);
    return payload;
  }

  getProgress(mockInterviewId) {
    return this.activeProgress.get(mockInterviewId) || null;
  }

  clearProgress(mockInterviewId) {
    this.activeProgress.delete(mockInterviewId);
  }
}

module.exports = new GenerationProgressEmitter();
