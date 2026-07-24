const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Attempt = require('../models/Attempt');
const Assessment = require('../models/Assessment');
const Subject = require('../models/Subject');
const Result = require('../models/Result');
const User = require('../models/User');

const runDiagnostics = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment');
    console.log('Connected.');

    const users = await User.find({}, 'name email role');
    console.log('\n--- Registered Users ---');
    console.log(users);

    const attempts = await Attempt.find({})
      .populate('student', 'name email')
      .populate('assessment', 'title type');
    console.log('\n--- Attempt Sessions ---');
    console.log(attempts.map(a => ({
      id: a._id,
      student: a.student?.email,
      assessment: a.assessment?.title,
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      marks: a.totalMarksObtained
    })));

    const results = await Result.find({})
      .populate('student', 'email')
      .populate('assessment', 'title');
    console.log('\n--- Graded Results ---');
    console.log(results.map(r => ({
      id: r._id,
      student: r.student?.email,
      assessment: r.assessment?.title,
      score: r.scoreObtained,
      status: r.status
    })));

    console.log('\n--- Query & Auto-Submit Emulation for Runalyi Salunkhe ---');
    const runalyiId = '6a4f2cfdc402deb5bbfce4a5';
    
    // Require services to emulate evaluation
    const evaluationService = require('../services/evaluationService');
    const leaderboardService = require('../services/leaderboardService');

    const runalyiAttempts = await Attempt.find({ student: runalyiId })
      .populate({
        path: 'assessment',
        populate: { path: 'subject', select: 'name code' }
      });

    const finalizedAttempts = [];

    for (let attempt of runalyiAttempts) {
      if (attempt.status === 'started' && attempt.assessment) {
        const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
        const totalSeconds = attempt.assessment.duration * 60;

        console.log(`Checking attempt ${attempt._id}: elapsed=${elapsed}s, totalSeconds=${totalSeconds}s`);

        if (elapsed >= totalSeconds) {
          console.log(`Attempt ${attempt._id} has expired. Finalizing...`);
          attempt.status = 'submitted';
          attempt.submittedAt = new Date(attempt.startedAt.getTime() + totalSeconds * 1000);
          attempt.timeTakenSeconds = totalSeconds;

          const assessment = attempt.assessment;
          const evaluation = await evaluationService.evaluateAttemptAnswers(assessment.questions, attempt.answers);
          
          attempt.answers = evaluation.gradedAnswers;
          attempt.totalMarksObtained = evaluation.totalMarksObtained;
          attempt.isPassed = evaluation.totalMarksObtained >= assessment.passingScore;

          const hasTheory = assessment.type === 'theory' || assessment.questions.some(q => q.questionModel === 'TheoryQuestion');
          if (hasTheory) {
            attempt.status = 'submitted';
            console.log(`Attempt ${attempt._id} is theory, status set to submitted`);
          } else {
            attempt.status = 'graded';
            console.log(`Attempt ${attempt._id} is graded: score=${attempt.totalMarksObtained}/${assessment.totalMarks}`);

            const percentage = Math.round((attempt.totalMarksObtained / assessment.totalMarks) * 100 * 100) / 100;
            await Result.findOneAndUpdate(
              { attempt: attempt._id },
              {
                student: attempt.student,
                assessment: assessment._id,
                attempt: attempt._id,
                totalMarks: assessment.totalMarks,
                scoreObtained: attempt.totalMarksObtained,
                percentage,
                status: attempt.isPassed ? 'pass' : 'fail',
                publishedAt: new Date()
              },
              { upsert: true }
            );
            await leaderboardService.recalculateLeaderboard(assessment._id);
          }
          await attempt.save();
        }
      }
      finalizedAttempts.push(attempt);
    }

    console.log('Finalized attempts:', finalizedAttempts.map(a => ({ id: a._id, status: a.status })));

    mongoose.connection.close();
  } catch (err) {
    console.error('Diagnostics failed:', err);
  }
};

runDiagnostics();
