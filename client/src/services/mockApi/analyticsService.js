import api from '../api';

export const analyticsService = {
  // Get recruiter dashboard overview analytics from MongoDB
  getOverview: async () => {
    try {
      const response = await api.get('/analytics/recruiter-dashboard');
      if (response.data && response.data.overview) {
        return response.data.overview;
      }
      return null;
    } catch (err) {
      console.error('[analyticsService Error] Failed to fetch recruiter dashboard overview:', err);
      throw err;
    }
  },

  // Get candidate intelligence profile for a specific candidate
  getCandidateIntelligence: async (candidateId) => {
    try {
      const response = await api.get(`/analytics/candidate/${candidateId}`);
      if (response.data && response.data.intelligence) {
        return response.data.intelligence;
      }
      return null;
    } catch (err) {
      console.error(`[analyticsService Error] Failed to fetch candidate intelligence for ${candidateId}:`, err);
      throw err;
    }
  },

  // Compare candidates dynamically
  compareCandidates: async (candidateIds = []) => {
    try {
      const response = await api.post('/analytics/compare', { candidateIds });
      if (response.data && response.data.comparisonMatrix) {
        return response.data.comparisonMatrix;
      }
      return [];
    } catch (err) {
      console.error('[analyticsService Error] Failed to compare candidates:', err);
      throw err;
    }
  },

  // Query AI Recruitment Assistant
  queryAssistant: async (prompt) => {
    try {
      const response = await api.post('/analytics/ai-assistant', { prompt });
      if (response.data && response.data.answer) {
        return { answer: response.data.answer };
      }
      return { answer: 'AI Assistant processed your query.' };
    } catch (err) {
      console.error('[analyticsService Error] Failed to query AI assistant:', err);
      throw err;
    }
  }
};

export const mockAnalyticsService = analyticsService;
export default analyticsService;
