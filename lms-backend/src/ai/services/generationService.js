const ProviderFactory = require('../providers/ProviderFactory');
const PromptRegistry = require('../prompts/registry');
const AILogger = require('../utils/aiLogger');

class GenerationService {
  /**
   * Normalize difficulty string to canonical database enum values.
   */
  static normalizeDifficulty(difficulty) {
    if (!difficulty || typeof difficulty !== 'string') return 'medium';
    const lower = difficulty.toLowerCase().trim();
    if (['easy', 'beginner', 'basic'].includes(lower)) return 'easy';
    if (['hard', 'advanced', 'expert', 'difficult'].includes(lower)) return 'hard';
    return 'medium';
  }

  /**
   * Pass 1: Validate raw provider response structure
   */
  static validateRawResponse(response, type) {
    if (!response || !response.data) {
      throw new Error('ERR_JSON_PARSE: AI Provider returned an empty or unparseable payload.');
    }
    
    const questions = response.data.questions;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('ERR_RAW_SCHEMA_INVALID: AI Provider failed to return a non-empty questions array.');
    }

    return questions;
  }

  /**
   * Pass 2: Validate canonical normalized question structure
   */
  static validateCanonicalQuestions(questions, type) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('ERR_CANONICAL_INVALID: Questions array must contain at least one question.');
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (type === 'mcq') {
        if (!q.questionText || typeof q.questionText !== 'string') {
          throw new Error(`ERR_CANONICAL_INVALID: MCQ at index ${i} is missing questionText.`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`ERR_CANONICAL_INVALID: MCQ at index ${i} must have at least 2 options.`);
        }
        if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
          q.correctAnswerIndex = 0; // Safe fallback
        }
      } else if (type === 'coding') {
        if (!q.problemStatement || typeof q.problemStatement !== 'string') {
          throw new Error(`ERR_CANONICAL_INVALID: Coding question at index ${i} is missing problemStatement.`);
        }
        if (!Array.isArray(q.testCases)) {
          q.testCases = [];
        }
      } else if (type === 'theory') {
        if (!q.questionText || typeof q.questionText !== 'string') {
          throw new Error(`ERR_CANONICAL_INVALID: Theory question at index ${i} is missing questionText.`);
        }
      }
    }

    return true;
  }

  /**
   * Generates questions dynamically based on topic and type with Two-Pass Validation.
   * @param {string} topic - The topic of the questions
   * @param {string} type - 'mcq', 'coding', or 'theory'
   * @param {string} difficulty - 'easy', 'medium', 'hard' (or beginner/advanced)
   * @param {number} count - Number of questions to generate
   */
  static async generateQuestions(topic, type, difficulty, count) {
    const startTime = Date.now();
    const normalizedDiff = this.normalizeDifficulty(difficulty);
    const { prompt, meta: promptMeta } = PromptRegistry.getPromptWithMeta('question', type, {
      topic,
      difficulty: normalizedDiff,
      count: String(count)
    });

    const provider = ProviderFactory.getProvider();
    let providerResponse;

    try {
      providerResponse = await provider.generateJson(prompt, {}, {
        temperature: 0.2,
        maxRetries: 3
      });

      // Pass 1: Raw Output Validation
      const rawQuestions = this.validateRawResponse(providerResponse, type);

      // Normalization
      const canonicalQuestions = rawQuestions.map((q) => {
        if (type === 'mcq') {
          const rawOptions = Array.isArray(q.options) ? q.options.map(String) : [];
          let correctIdx = 0;
          if (typeof q.correctAnswerIndex === 'number') {
            correctIdx = q.correctAnswerIndex;
          } else if (typeof q.correct === 'number') {
            correctIdx = q.correct;
          } else if (typeof q.correctAnswer === 'string') {
            const idx = rawOptions.indexOf(q.correctAnswer);
            correctIdx = idx !== -1 ? idx : 0;
          }

          return {
            questionText: q.questionText || q.question || 'Untitled Question',
            options: rawOptions.length >= 2 ? rawOptions : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: correctIdx,
            explanation: q.explanation || q.rationale || 'No explanation provided.'
          };
        } else if (type === 'coding') {
          const rawCases = Array.isArray(q.testCases)
            ? q.testCases.map((tc) => ({
                input: String(tc.input || ''),
                expectedOutput: String(tc.expectedOutput || tc.output || '')
              }))
            : [];

          return {
            problemStatement: q.problemStatement || q.problem || q.description || 'Untitled Problem Statement',
            boilerplate: q.boilerplate || q.starterCode || '// Starter code\n',
            testCases: rawCases
          };
        } else if (type === 'theory') {
          return {
            questionText: q.questionText || q.question || 'Untitled Theory Question',
            gradingRubric: q.gradingRubric || q.rubric || 'Standard comprehensive grading rubric.'
          };
        }
        return q;
      });

      // Pass 2: Canonical Validation
      this.validateCanonicalQuestions(canonicalQuestions, type);

      // Telemetry Logging
      const durationMs = Date.now() - startTime;
      await AILogger.logCall({
        feature: 'question_generation',
        questionType: type,
        provider: provider.name || 'groq',
        model: providerResponse.telemetry?.model || 'llama-3.1-8b-instant',
        prompt: promptMeta,
        durationMs,
        retryCount: providerResponse.telemetry?.retryCount || 0,
        tokensIn: providerResponse.usage?.promptTokens || 0,
        tokensOut: providerResponse.usage?.completionTokens || 0,
        totalTokens: providerResponse.usage?.totalTokens || 0,
        success: true,
        errorCategory: null
      });

      return { questions: canonicalQuestions };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      await AILogger.logCall({
        feature: 'question_generation',
        questionType: type,
        provider: provider.name || 'groq',
        model: 'llama-3.1-8b-instant',
        prompt: promptMeta,
        durationMs,
        retryCount: providerResponse?.telemetry?.retryCount || 0,
        tokensIn: 0,
        tokensOut: 0,
        totalTokens: 0,
        success: false,
        errorCategory: error.message?.split(':')[0] || 'ERR_UNEXPECTED',
        errorMessage: error.message
      });

      throw error;
    }
  }
}

module.exports = GenerationService;
