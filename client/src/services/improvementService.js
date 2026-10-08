import api from './api';

export const improvementService = {
  /**
   * Get All User Activities across all interviews
   */
  getAllUserActivities: async () => {
    try {
      const response = await api.get('/activities');
      return response.data;
    } catch (error) {
      console.warn('[IMPROVEMENT_SERVICE] Falling back for all user activities:', error);
      throw error;
    }
  },

  /**
   * Get Interview Improvement Summary (+Δ score, activities progress)
   */
  getInterviewImprovementSummary: async (interviewId) => {
    try {
      const response = await api.get(`/interviews/${interviewId}/improvement`);
      return response.data;
    } catch (error) {
      console.warn('[IMPROVEMENT_SERVICE] Falling back for summary:', error);
      throw error;
    }
  },

  /**
   * Get Activities list for an Interview
   */
  getActivitiesForInterview: async (interviewId) => {
    try {
      const response = await api.get(`/interviews/${interviewId}/activities`);
      return response.data;
    } catch (error) {
      console.warn('[IMPROVEMENT_SERVICE] Falling back for activities:', error);
      throw error;
    }
  },

  /**
   * Generate Activities for an Interview
   */
  generateActivities: async (interviewId) => {
    try {
      const response = await api.post(`/interviews/${interviewId}/activities/generate`);
      return response.data;
    } catch (error) {
      console.error('[IMPROVEMENT_SERVICE] Error generating activities:', error);
      throw error;
    }
  },

  /**
   * Get Single Activity Details & History
   */
  getActivityById: async (activityId) => {
    try {
      const response = await api.get(`/improvement-activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('[IMPROVEMENT_SERVICE] Error fetching activity:', error);
      throw error;
    }
  },

  /**
   * Start Practice Session for Activity
   */
  startPracticeSession: async (activityId) => {
    try {
      const response = await api.post(`/improvement-activities/${activityId}/practice/start`);
      return response.data;
    } catch (error) {
      console.error('[IMPROVEMENT_SERVICE] Error starting practice session:', error);
      throw error;
    }
  },

  /**
   * Submit Practice Session Answers for Deterministic Evaluation
   */
  submitPracticeSession: async (activityId, sessionId, responses) => {
    try {
      const response = await api.post(`/improvement-activities/${activityId}/practice/submit`, {
        sessionId,
        responses
      });
      return response.data;
    } catch (error) {
      console.error('[IMPROVEMENT_SERVICE] Error submitting practice session:', error);
      throw error;
    }
  },

  /**
   * Get Practice History for Activity
   */
  getPracticeHistory: async (activityId) => {
    try {
      const response = await api.get(`/improvement-activities/${activityId}/history`);
      return response.data;
    } catch (error) {
      console.error('[IMPROVEMENT_SERVICE] Error fetching practice history:', error);
      throw error;
    }
  }
};
