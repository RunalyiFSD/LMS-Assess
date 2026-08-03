const testJsonExtractor = require('./jsonExtractor.test');
const testPromptRegistry = require('./promptRegistry.test');
const testAiResilience = require('./aiResilience.test');

console.log('====================================================');
console.log('       LMS-Assess AI Platform Test Runner          ');
console.log('====================================================\n');

let failed = false;

try {
  testJsonExtractor();
  testPromptRegistry();
  testAiResilience();
  console.log('====================================================');
  console.log('  🎉 ALL AI PLATFORM TESTS COMPLETED SUCCESSFULLY!  ');
  console.log('====================================================');
} catch (error) {
  failed = true;
  console.error('\n❌ TEST FAILURE DETECTED:');
  console.error(error);
}

if (failed) {
  process.exit(1);
}
