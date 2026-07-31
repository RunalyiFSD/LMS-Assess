const ProviderFactory = require('../providers/ProviderFactory');
const PromptRegistry = require('../prompts/registry');

class GenerationService {
  /**
   * Generates questions dynamically based on topic and type.
   * @param {string} topic - The topic of the questions
   * @param {string} type - 'mcq', 'coding', or 'theory'
   * @param {string} difficulty - 'beginner', 'intermediate', 'advanced'
   * @param {number} count - Number of questions to generate
   */
  static async generateQuestions(topic, type, difficulty, count) {
    const prompt = PromptRegistry.getPrompt('question', type, {
      topic,
      difficulty,
      count: String(count)
    });

    const provider = ProviderFactory.getProvider();

    // Define schema based on question type
    let schema = {};
    if (type === 'mcq') {
      schema = {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionText: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correctAnswerIndex: { type: 'number' },
                explanation: { type: 'string' }
              },
              required: ['questionText', 'options', 'correctAnswerIndex', 'explanation']
            }
          }
        },
        required: ['questions']
      };
    } else if (type === 'coding') {
      schema = {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                problemStatement: { type: 'string' },
                boilerplate: { type: 'string' },
                testCases: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      input: { type: 'string' },
                      expectedOutput: { type: 'string' }
                    },
                    required: ['input', 'expectedOutput']
                  }
                }
              },
              required: ['problemStatement', 'boilerplate', 'testCases']
            }
          }
        },
        required: ['questions']
      };
    } else if (type === 'theory') {
      schema = {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionText: { type: 'string' },
                gradingRubric: { type: 'string' }
              },
              required: ['questionText', 'gradingRubric']
            }
          }
        },
        required: ['questions']
      };
    }

    const response = await provider.generateJson(prompt, schema);

    // Defensive programming: Guard against LLM hallucinations
    if (!response || !response.data) {
      throw new Error('AI Provider returned an invalid or empty payload.');
    }
    
    if (!response.data.questions || !Array.isArray(response.data.questions)) {
      throw new Error('AI Provider failed to return a valid questions array.');
    }

    // Normalize response to canonical schema
    const canonicalQuestions = response.data.questions.map(q => {
      if (type === 'mcq') {
        return {
          questionText: q.questionText || q.question || '',
          options: q.options || [],
          correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correct !== undefined ? q.correct : 0),
          explanation: q.explanation || ''
        };
      } else if (type === 'coding') {
        return {
          problemStatement: q.problemStatement || q.problem || q.description || '',
          boilerplate: q.boilerplate || q.starterCode || '',
          testCases: q.testCases || []
        };
      } else if (type === 'theory') {
        return {
          questionText: q.questionText || q.question || '',
          gradingRubric: q.gradingRubric || q.rubric || ''
        };
      }
      return q;
    });

    return { questions: canonicalQuestions };
  }
}

module.exports = GenerationService;
