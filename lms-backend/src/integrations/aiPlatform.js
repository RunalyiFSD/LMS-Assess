const axios = require('axios');
const FormData = require('form-data');

class AIPlatformClient {
  constructor() {
    this.baseURL = process.env.AI_PLATFORM_URL || 'http://127.0.0.1:8000/api/v1/ai';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds timeout for AI generation
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a chat message to the AI Gateway.
   * @param {string} sessionId - Unique session ID (can be user ID + context ID)
   * @param {string} message - User's prompt
   * @param {string} agentType - Type of agent to route to
   * @param {string} contextId - Associated context ID (e.g., courseId)
   * @returns {Promise<string>} AI response text
   */
  async sendChat(sessionId, message, agentType = 'general', contextId = 'global') {
    try {
      const response = await this.client.post('/chat', {
        session_id: sessionId,
        message,
        agent_type: agentType,
        context_id: contextId
      });

      if (response.data && response.data.status === 'success') {
        return response.data.response;
      }
      throw new Error('Invalid response structure from AI Platform');
    } catch (error) {
      console.error('AI Platform Client Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to communicate with AI Platform');
    }
  }

  /**
   * Upload a document to the AI Platform RAG pipeline
   */
  async ingestDocument(courseId, documentTitle, fileBuffer, originalFilename) {
    try {
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('document_title', documentTitle);
      formData.append('file', fileBuffer, { filename: originalFilename });

      const response = await this.client.post('/rag/ingest', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

      if (response.data && response.data.status === 'success') {
        return response.data;
      }
      throw new Error('Invalid response structure from AI Platform RAG');
    } catch (error) {
      console.error('AI Platform RAG Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to ingest document into AI Platform');
    }
  }
}

module.exports = new AIPlatformClient();
