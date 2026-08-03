const assert = require('assert');
const GenerationService = require('../../src/ai/services/generationService');

function testAiResilience() {
  console.log('--- [TEST SUITE] AI Resilience & Two-Pass Validation ---');

  // Test 1: Difficulty Normalization
  assert.strictEqual(GenerationService.normalizeDifficulty('Beginner'), 'easy');
  assert.strictEqual(GenerationService.normalizeDifficulty('basic'), 'easy');
  assert.strictEqual(GenerationService.normalizeDifficulty('Advanced'), 'hard');
  assert.strictEqual(GenerationService.normalizeDifficulty('EXPERT'), 'hard');
  assert.strictEqual(GenerationService.normalizeDifficulty('Intermediate'), 'medium');
  assert.strictEqual(GenerationService.normalizeDifficulty(null), 'medium');
  console.log('✓ Test 1: Difficulty normalization across all aliases passed.');

  // Test 2: Pass 1 Raw Validation (Valid Payload)
  const validRaw = {
    data: {
      questions: [
        { questionText: 'What is O(log n)?', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 2 }
      ]
    }
  };
  const extracted = GenerationService.validateRawResponse(validRaw, 'mcq');
  assert.strictEqual(extracted.length, 1);
  console.log('✓ Test 2: Pass 1 Raw Validation with valid structure passed.');

  // Test 3: Pass 1 Raw Validation (Missing questions array)
  assert.throws(() => {
    GenerationService.validateRawResponse({ data: {} }, 'mcq');
  }, /ERR_RAW_SCHEMA_INVALID/);
  console.log('✓ Test 3: Pass 1 Raw Validation correctly throws ERR_RAW_SCHEMA_INVALID.');

  // Test 4: Pass 2 Canonical Validation (MCQ missing questionText)
  assert.throws(() => {
    GenerationService.validateCanonicalQuestions([
      { options: ['A', 'B'], correctAnswerIndex: 0 }
    ], 'mcq');
  }, /ERR_CANONICAL_INVALID/);
  console.log('✓ Test 4: Pass 2 Canonical Validation correctly catches missing MCQ questionText.');

  // Test 5: Pass 2 Canonical Validation (Coding missing problemStatement)
  assert.throws(() => {
    GenerationService.validateCanonicalQuestions([
      { testCases: [] }
    ], 'coding');
  }, /ERR_CANONICAL_INVALID/);
  console.log('✓ Test 5: Pass 2 Canonical Validation correctly catches missing problemStatement.');

  // Test 6: Pass 2 Canonical Validation (Valid questions pass)
  const validCanonical = [
    { questionText: 'Valid Question?', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 }
  ];
  assert.strictEqual(GenerationService.validateCanonicalQuestions(validCanonical, 'mcq'), true);
  console.log('✓ Test 6: Pass 2 Canonical Validation passes valid normalized items.');

  console.log('All AI Resilience tests passed successfully!\n');
}

module.exports = testAiResilience;

if (require.main === module) {
  testAiResilience();
}
