const http = require('http');
const app = require('../../src/app');

/**
 * Automated Test Suite: HTTP Security & Header Hardening
 */
async function runHttpSecurityTests() {
  console.log('\n🛡 Starting HTTP Security & Helmet Header Tests...\n');
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

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    const headers = res.headers;

    // Test 1: X-Content-Type-Options: nosniff
    assert(headers.get('x-content-type-options') === 'nosniff', 'Header x-content-type-options: nosniff is set by Helmet');

    // Test 2: X-Frame-Options or Content-Security-Policy frame-ancestors
    const xFrame = headers.get('x-frame-options');
    const csp = headers.get('content-security-policy');
    assert(xFrame === 'SAMEORIGIN' || (csp && csp.includes('frame-ancestors')), 'Frame protection (Clickjacking prevention) is enforced');

    // Test 3: X-XSS-Protection or CSP
    assert(headers.has('content-security-policy') || headers.has('x-content-type-options'), 'Content-Security-Policy/MIME headers are present');

    // Test 4: Rate limit headers present
    assert(headers.has('ratelimit-limit') || headers.has('ratelimit-remaining'), 'Standard RateLimit headers are attached');

  } catch (err) {
    assert(false, `HTTP security test error: ${err.message}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\n========================================`);
  console.log(`HTTP Security Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (require.main === module) {
  runHttpSecurityTests()
    .then((res) => {
      setTimeout(() => process.exit(res.failed > 0 ? 1 : 0), 100);
    })
    .catch((err) => {
      console.error('Fatal test error:', err);
      process.exit(1);
    });
}

module.exports = { runHttpSecurityTests };
