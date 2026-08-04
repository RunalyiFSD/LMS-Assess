const ProviderFactory = require('../providers/ProviderFactory');
const PromptRegistry = require('../prompts/registry');

class EvaluationService {
  /**
   * Universal response schema for all evaluation endpoints
   */
  static get responseSchema() {
    return {
      type: 'object',
      properties: {
        score: { type: 'number', description: 'Score out of 100' },
        feedback: { type: 'string', description: 'Qualitative feedback for the student' },
        isCorrect: { type: 'boolean' }
      },
      required: ['score', 'feedback', 'isCorrect']
    };
  }

  static async evaluateMCQ(question, correctAnswer, studentAnswer) {
    const { prompt, meta } = PromptRegistry.getPromptWithMeta('evaluation', 'mcq', {
      question,
      correct_answer: correctAnswer,
      student_answer: studentAnswer
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.responseSchema);
    return {
      ...response.data,
      usage: response.usage,
      telemetry: response.telemetry,
      provider: provider.config?.provider || 'groq',
      modelName: response.telemetry?.model || 'llama-3.1-8b-instant',
      promptHash: meta?.hash || 'evaluation_mcq_v1',
      rawAiResponse: JSON.stringify(response.data)
    };
  }

  static async evaluateCoding(problemStatement, studentCode) {
    const { prompt, meta } = PromptRegistry.getPromptWithMeta('evaluation', 'coding', {
      problem_statement: problemStatement,
      student_code: studentCode
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.responseSchema);
    return {
      ...response.data,
      usage: response.usage,
      telemetry: response.telemetry,
      provider: provider.config?.provider || 'groq',
      modelName: response.telemetry?.model || 'llama-3.1-8b-instant',
      promptHash: meta?.hash || 'evaluation_coding_v1',
      rawAiResponse: JSON.stringify(response.data)
    };
  }

  static async evaluateTheory(question, rubric, studentAnswer) {
    const { prompt, meta } = PromptRegistry.getPromptWithMeta('evaluation', 'theory', {
      question,
      rubric,
      student_answer: studentAnswer
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.responseSchema);
    return {
      ...response.data,
      usage: response.usage,
      telemetry: response.telemetry,
      provider: provider.config?.provider || 'groq',
      modelName: response.telemetry?.model || 'llama-3.1-8b-instant',
      promptHash: meta?.hash || 'evaluation_theory_v1',
      rawAiResponse: JSON.stringify(response.data)
    };
  }
}

module.exports = EvaluationService;
