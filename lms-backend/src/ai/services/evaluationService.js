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
    const prompt = PromptRegistry.getPrompt('evaluation', 'mcq', {
      question,
      correct_answer: correctAnswer,
      student_answer: studentAnswer
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.responseSchema);
    return response.data;
  }

  static async evaluateCoding(problemStatement, studentCode) {
    const prompt = PromptRegistry.getPrompt('evaluation', 'coding', {
      problem_statement: problemStatement,
      student_code: studentCode
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.responseSchema);
    return response.data;
  }

  static async evaluateTheory(question, rubric, studentAnswer) {
    const prompt = PromptRegistry.getPrompt('evaluation', 'theory', {
      question,
      rubric,
      student_answer: studentAnswer
    });
    const provider = ProviderFactory.getProvider();
    const response = await provider.generateJson(prompt, this.responseSchema);
    return response.data;
  }
}

module.exports = EvaluationService;
