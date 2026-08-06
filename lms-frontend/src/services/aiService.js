import api from './api';

class AIService {
  /**
   * Request AI-generated questions from the backend.
   * @param {Object} payload { topic, type, difficulty, count }
   * @returns {Promise<Object>} The generated data
   */
  static async generateQuestions(payload) {
    try {
      // Use the generic api utility which already attaches JWT and handles base URLs
      const response = await api.post('/v1/ai/generate/questions', payload);
      return response.data; // Expected: { status: 'success', data: { questions: [...] } }
    } catch (error) {
      // Re-throw with a clean message for the UI
      const message = error.response?.data?.message || error.message || 'Network error occurred during AI generation';
      throw new Error(message);
    }
  }
}

export default AIService;
