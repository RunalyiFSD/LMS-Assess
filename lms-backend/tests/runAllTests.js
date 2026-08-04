const { runAllAiTests } = require('./ai/runAllAiTests');
const { runCodeSecurityTests } = require('./security/codeSecurity.test');
const { runHttpSecurityTests } = require('./security/httpSecurity.test');
const { runIndexVerificationTests } = require('./database/indexes.test');

/**
 * Master Unified Test Runner for LMS-Assess Backend
 */
async function runAllTests() {
  console.log('========================================================');
  console.log('🧪 Starting LMS-Assess v1.0 Unified Test Suite');
  console.log('========================================================\n');

  let totalPassed = 0;
  let totalFailed = 0;

  // Suite 1: AI Resilience & Providers
  try {
    const res = await runAllAiTests();
    totalPassed += (res && res.passed) ? res.passed : 0;
    totalFailed += (res && res.failed) ? res.failed : 0;
  } catch (err) {
    console.error('AI Suite failed:', err);
    totalFailed++;
  }

  // Suite 2: Code Execution Sandboxing & Security
  try {
    const res = await runCodeSecurityTests();
    totalPassed += (res && res.passed) ? res.passed : 0;
    totalFailed += (res && res.failed) ? res.failed : 0;
  } catch (err) {
    console.error('Code Security Suite failed:', err);
    totalFailed++;
  }

  // Suite 3: HTTP Security Headers & Helmet
  try {
    const res = await runHttpSecurityTests();
    totalPassed += (res && res.passed) ? res.passed : 0;
    totalFailed += (res && res.failed) ? res.failed : 0;
  } catch (err) {
    console.error('HTTP Security Suite failed:', err);
    totalFailed++;
  }

  // Suite 4: Database Compound Indexes
  try {
    const res = await runIndexVerificationTests();
    totalPassed += (res && res.passed) ? res.passed : 0;
    totalFailed += (res && res.failed) ? res.failed : 0;
  } catch (err) {
    console.error('Database Index Suite failed:', err);
    totalFailed++;
  }

  console.log('========================================================');
  console.log(`🏁 Final Test Summary: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log('========================================================\n');

  if (totalFailed > 0) {
    console.error('❌ Test suite finished with failures.');
    process.exit(1);
  } else {
    console.log('🎉 All automated tests passed successfully!');
    process.exit(0);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
