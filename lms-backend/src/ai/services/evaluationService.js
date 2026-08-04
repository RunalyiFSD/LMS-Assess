const ProviderFactory = require('../providers/ProviderFactory');
const PromptRegistry = require('../prompts/registry');

class EvaluationService {
  static get mcqResponseSchema() {
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

  static get theoryResponseSchema() {
    return {
      type: 'object',
      properties: {
        score: { type: 'number', description: 'Score out of 100' },
        confidence: { type: 'number', description: 'Evaluation confidence between 0.0 and 1.0' },
        accuracy: { type: 'number', description: 'Accuracy rating from 0 to 10' },
        completeness: { type: 'number', description: 'Completeness rating from 0 to 10' },
        terminology: { type: 'number', description: 'Terminology rating from 0 to 10' },
        feedback: { type: 'string', description: 'Constructive feedback' },
        isCorrect: { type: 'boolean' }
      },
      required: ['score', 'confidence', 'accuracy', 'completeness', 'terminology', 'feedback', 'isCorrect']
    };
  }

  static get codingResponseSchema() {
    return {
      type: 'object',
      properties: {
        complexity: {
          type: 'object',
          properties: {
            time: { type: 'string' },
            space: { type: 'string' }
          }
        },
        optimizationSuggestions: {
          type: 'array',
          items: { type: 'string' }
        },
        edgeCases: {
          type: 'array',
          items: { type: 'string' }
        },
        styleFeedback: { type: 'string' },
        feedback: { type: 'string' }
      },
      required: ['complexity', 'optimizationSuggestions', 'edgeCases', 'styleFeedback', 'feedback']
    };
  }

  static async evaluateMCQ(question, correctAnswer, studentAnswer) {
    const { prompt, meta } = PromptRegistry.getPromptWithMeta('evaluation', 'mcq', {
      question,
      correct_answer: correctAnswer,
      student_answer: studentAnswer
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.mcqResponseSchema);
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

  static async evaluateCoding(problemStatement, studentCode, executionSummary = 'All tests executed.') {
    const { prompt, meta } = PromptRegistry.getPromptWithMeta('evaluation', 'coding', {
      problem_statement: problemStatement,
      student_code: studentCode,
      execution_summary: executionSummary
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.codingResponseSchema);
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
    const response = await provider.generateJson(prompt, this.theoryResponseSchema);
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
