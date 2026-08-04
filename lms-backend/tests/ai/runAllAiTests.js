const testJsonExtractor = require('./jsonExtractor.test');
const testPromptRegistry = require('./promptRegistry.test');
const testAiResilience = require('./aiResilience.test');

function runAllAiTests() {
  console.log('====================================================');
  console.log('       LMS-Assess AI Platform Test Runner          ');
  console.log('====================================================\n');

  let failed = 0;
  let passed = 0;

  try {
    testJsonExtractor();
    passed += 6;
  } catch (err) {
    failed++;
    console.error('JsonExtractor tests failed:', err.message);
  }

  try {
    testPromptRegistry();
    passed += 3;
  } catch (err) {
    failed++;
    console.error('PromptRegistry tests failed:', err.message);
  }

  try {
    testAiResilience();
    passed += 6;
  } catch (err) {
    failed++;
    console.error('AI Resilience tests failed:', err.message);
  }

  console.log('====================================================');
  if (failed === 0) {
    console.log('  🎉 ALL AI PLATFORM TESTS COMPLETED SUCCESSFULLY!  ');
  } else {
    console.log(`  ⚠️ AI Tests Finished: ${passed} passed, ${failed} failed`);
  }
  console.log('====================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  const res = runAllAiTests();
  process.exit(res.failed > 0 ? 1 : 0);
}

module.exports = { runAllAiTests };
