const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Attempt = require('../../src/models/Attempt');
const Result = require('../../src/models/Result');
const Assessment = require('../../src/models/Assessment');
const MCQQuestion = require('../../src/models/MCQQuestion');
const CodingQuestion = require('../../src/models/CodingQuestion');
const TheoryQuestion = require('../../src/models/TheoryQuestion');

/**
 * Automated Test Suite: Compound Indexes Verification
 */
async function runIndexVerificationTests() {
  console.log('\n🗄 Starting Database Compound Indexes Verification Tests...\n');
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

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_assess';
  await mongoose.connect(mongoUri);

  try {
    // 1. Sync indexes
    await Attempt.syncIndexes();
    await Result.syncIndexes();
    await Assessment.syncIndexes();
    await MCQQuestion.syncIndexes();
    await CodingQuestion.syncIndexes();
    await TheoryQuestion.syncIndexes();

    // 2. Inspect Attempt indexes
    const attemptIndexes = await Attempt.collection.indexes();
    const hasAttemptUnique = attemptIndexes.some(idx => idx.key.student === 1 && idx.key.assessment === 1 && idx.unique);
    const hasAttemptStatus = attemptIndexes.some(idx => idx.key.assessment === 1 && idx.key.status === 1);
    assert(hasAttemptUnique, 'Attempt unique index on { student: 1, assessment: 1 } exists');
    assert(hasAttemptStatus, 'Attempt compound index on { assessment: 1, status: 1 } exists');

    // 3. Inspect Result indexes
    const resultIndexes = await Result.collection.indexes();
    const hasResultLeaderboard = resultIndexes.some(idx => idx.key.assessment === 1 && idx.key.scoreObtained === -1);
    assert(hasResultLeaderboard, 'Result compound index on { assessment: 1, scoreObtained: -1 } exists');

    // 4. Inspect Assessment indexes
    const assessmentIndexes = await Assessment.collection.indexes();
    const hasAssessmentSchedule = assessmentIndexes.some(idx => idx.key.isActive === 1 && idx.key.scheduledAt === 1 && idx.key.dueDate === 1);
    assert(hasAssessmentSchedule, 'Assessment compound index on { isActive: 1, scheduledAt: 1, dueDate: 1 } exists');

    // 5. Inspect Question indexes
    const mcqIndexes = await MCQQuestion.collection.indexes();
    const hasMcqSubjectDiff = mcqIndexes.some(idx => idx.key.subject === 1 && idx.key.difficulty === 1);
    assert(hasMcqSubjectDiff, 'MCQQuestion compound index on { subject: 1, difficulty: 1 } exists');

  } catch (err) {
    assert(false, `Index verification error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
  }

  console.log(`\n========================================`);
  console.log(`Index Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (require.main === module) {
  runIndexVerificationTests()
    .then((res) => {
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal index test error:', err);
      process.exit(1);
    });
}

module.exports = { runIndexVerificationTests };
