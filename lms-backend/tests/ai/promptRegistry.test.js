const assert = require('assert');
const PromptRegistry = require('../../src/ai/prompts/registry');

function testPromptRegistry() {
  console.log('--- [TEST SUITE] PromptRegistry ---');

  // Test 1: Load and compile prompt with variables
  const compiled = PromptRegistry.getPrompt('question', 'mcq', {
    topic: 'Binary Search Trees',
    difficulty: 'medium',
    count: '3'
  });

  assert.strictEqual(typeof compiled, 'string');
  assert.strictEqual(compiled.includes('Binary Search Trees'), true);
  assert.strictEqual(compiled.includes('medium'), true);
  assert.strictEqual(compiled.includes('3'), true);
  assert.strictEqual(compiled.includes('{{topic}}'), false);
  console.log('✓ Test 1: Prompt variable substitution passed.');

  // Test 2: Prompt Metadata and Checksum Hashing
  const { meta } = PromptRegistry.getPromptWithMeta('question', 'mcq', {
    topic: 'Arrays',
    difficulty: 'easy',
    count: '1'
  });

  assert.strictEqual(meta.version, '1.1.0');
  assert.strictEqual(typeof meta.hash, 'string');
  assert.strictEqual(meta.hash.length, 12);
  console.log('✓ Test 2: Prompt versioning (v1.1.0) and SHA-256 hash passed.');

  // Test 3: Missing Prompt Template throws error
  assert.throws(() => {
    PromptRegistry.loadTemplate('invalid_domain', 'non_existent');
  }, /Prompt template not found/);
  console.log('✓ Test 3: Missing template error handling passed.');

  console.log('All PromptRegistry tests passed successfully!\n');
}

module.exports = testPromptRegistry;

if (require.main === module) {
  testPromptRegistry();
}
