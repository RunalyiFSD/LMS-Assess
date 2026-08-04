const assert = require('assert');
const JsonExtractor = require('../../src/ai/utils/jsonExtractor');

function testJsonExtractor() {
  console.log('--- [TEST SUITE] JsonExtractor ---');

  // Test 1: Clean JSON
  const clean = '{"status": "ok", "value": 100}';
  const res1 = JsonExtractor.extractAndParse(clean);
  assert.strictEqual(res1.status, 'ok');
  assert.strictEqual(res1.value, 100);
  console.log('✓ Test 1: Clean JSON parse passed.');

  // Test 2: Markdown fenced JSON
  const fenced = '```json\n{\n  "questions": [\n    {"questionText": "What is Node?"}\n  ]\n}\n```';
  const res2 = JsonExtractor.extractAndParse(fenced);
  assert.strictEqual(Array.isArray(res2.questions), true);
  assert.strictEqual(res2.questions[0].questionText, 'What is Node?');
  console.log('✓ Test 2: Markdown fenced JSON (```json ... ```) passed.');

  // Test 3: Markdown fence without language tag
  const fencedNoTag = '```\n{"result": true}\n```';
  const res3 = JsonExtractor.extractAndParse(fencedNoTag);
  assert.strictEqual(res3.result, true);
  console.log('✓ Test 3: Markdown fence without tag (``` ... ```) passed.');

  // Test 4: Conversational Prefix and Suffix
  const conversational = 'Here is the requested question:\n{"questionText": "What is React?", "options": ["A", "B"]}\nI hope this helps your assessment!';
  const res4 = JsonExtractor.extractAndParse(conversational);
  assert.strictEqual(res4.questionText, 'What is React?');
  console.log('✓ Test 4: Conversational prefix and suffix extraction passed.');

  // Test 5: Array Root
  const arrayRoot = '[{"id": 1}, {"id": 2}]';
  const res5 = JsonExtractor.extractAndParse(arrayRoot);
  assert.strictEqual(res5.length, 2);
  assert.strictEqual(res5[1].id, 2);
  console.log('✓ Test 5: Root JSON array extraction passed.');

  // Test 6: Invalid Non-JSON String Throws Error
  assert.throws(() => {
    JsonExtractor.extractAndParse('Just plain conversational text with no braces');
  }, /JSON Extraction failed/);
  console.log('✓ Test 6: Unparseable non-JSON error handling passed.');

  console.log('All JsonExtractor tests passed successfully!\n');
}

module.exports = testJsonExtractor;

if (require.main === module) {
  testJsonExtractor();
}
