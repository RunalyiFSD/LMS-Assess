const ProviderFactory = require('../providers/ProviderFactory');
const PromptRegistry = require('../prompts/registry');

class AnalyticsService {
  
  static async analyzeWeakTopics(evaluationsData) {
    const prompt = PromptRegistry.getPrompt('analytics', 'weak_topics', {
      evaluations_json: JSON.stringify(evaluationsData)
    });
    
    const schema = {
      type: 'object',
      properties: {
        weak_topics: { type: 'array', items: { type: 'string' } }
      },
      required: ['weak_topics']
    };

    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, schema);
    return response.data;
  }

  static async generateRecommendations(weakTopics) {
    const prompt = PromptRegistry.getPrompt('analytics', 'recommendations', {
      weak_topics_json: JSON.stringify(weakTopics)
    });
    
    const schema = {
      type: 'object',
      properties: {
        recommendations: { type: 'array', items: { type: 'string' } }
      },
      required: ['recommendations']
    };

    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, schema);
    return response.data;
  }

  static async getStudentMetrics(studentData) {
    const prompt = PromptRegistry.getPrompt('analytics', 'student_metrics', {
      student_data_json: JSON.stringify(studentData)
    });
    
    const schema = {
      type: 'object',
      properties: {
        insights: { type: 'string' }
      },
      required: ['insights']
    };

    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, schema);
    return response.data;
  }

  static async getInstructorMetrics(classData) {
    const prompt = PromptRegistry.getPrompt('analytics', 'instructor_metrics', {
      class_data_json: JSON.stringify(classData)
    });
    
    const schema = {
      type: 'object',
      properties: {
        insights: { type: 'string' }
      },
      required: ['insights']
    };

    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, schema);
    return response.data;
  }
}

module.exports = AnalyticsService;
