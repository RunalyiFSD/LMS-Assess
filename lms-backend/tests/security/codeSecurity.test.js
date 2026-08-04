const codeExecutionService = require('../../src/services/codeExecutionService');

/**
 * Automated Test Suite: Code Execution Sandboxing & Security Layer
 */
async function runCodeSecurityTests() {
  console.log('\n🔒 Starting Code Execution Security & Sandboxing Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  };

  // Test 1: Safe JavaScript code execution
  try {
    const safeJs = `
      let input = '';
      process.stdin.on('data', (d) => { input += d; });
      process.stdin.on('end', () => {
        const num = parseInt(input.trim());
        console.log(num * 2);
      });
    `;
    const testCases = [{ input: '5', expectedOutput: '10' }];
    const res = await codeExecutionService.executeCode(safeJs, 'javascript', testCases, 2000);
    assert(res.testCasesPassed === 1 && !res.securityViolation, 'Safe JavaScript execution succeeds');
  } catch (err) {
    assert(false, `Safe JS execution threw error: ${err.message}`);
  }

  // Test 2: Malicious JavaScript requiring child_process
  try {
    const maliciousJs = `
      const cp = require('child_process');
      cp.execSync('whoami');
    `;
    const res = await codeExecutionService.executeCode(maliciousJs, 'javascript', [{ input: '1', expectedOutput: '1' }]);
    assert(res.securityViolation === true && res.testCasesPassed === 0, 'Blocked JavaScript child_process execution');
  } catch (err) {
    assert(false, `Malicious JS test threw: ${err.message}`);
  }

  // Test 3: Malicious JavaScript accessing process.env (sensitive secret extraction)
  try {
    const envStealer = `
      console.log(process.env.JWT_SECRET);
    `;
    const res = await codeExecutionService.executeCode(envStealer, 'javascript', [{ input: '1', expectedOutput: '1' }]);
    assert(res.securityViolation === true, 'Blocked JavaScript process.env inspection');
  } catch (err) {
    assert(false, `Process.env test threw: ${err.message}`);
  }

  // Test 4: Malicious Python importing os/subprocess
  try {
    const maliciousPy = `
      import os
      print(os.listdir('.'))
    `;
    const res = await codeExecutionService.executeCode(maliciousPy, 'python', [{ input: '1', expectedOutput: '1' }]);
    assert(res.securityViolation === true && res.testCasesPassed === 0, 'Blocked Python import os execution');
  } catch (err) {
    assert(false, `Malicious Py test threw: ${err.message}`);
  }

  // Test 5: Infinite loop / Timeout protection
  try {
    const infiniteLoop = `
      while(true) {}
    `;
    const res = await codeExecutionService.executeCode(infiniteLoop, 'javascript', [{ input: '1', expectedOutput: '1' }], 1000);
    assert(res.executionLogs.includes('Time Limit Exceeded'), 'Enforced execution timeout on infinite loop');
  } catch (err) {
    assert(false, `Infinite loop test threw: ${err.message}`);
  }

  // Test 6: Memory / Buffer overflow protection
  try {
    const memoryBomb = `
      for (let i = 0; i < 500000; i++) {
        console.log('A'.repeat(100));
      }
    `;
    const res = await codeExecutionService.executeCode(memoryBomb, 'javascript', [{ input: '1', expectedOutput: '1' }], 2000);
    assert(res.testCasesPassed === 0 && (res.executionLogs.includes('Buffer ceiling') || res.executionLogs.includes('Failed')), 'Protected against excessive output / buffer overflow');
  } catch (err) {
    assert(false, `Buffer test threw: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Security Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (require.main === module) {
  runCodeSecurityTests()
    .then((res) => {
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal test error:', err);
      process.exit(1);
    });
}

module.exports = { runCodeSecurityTests };
