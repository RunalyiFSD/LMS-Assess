const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const Assessment = require('../models/Assessment');
const Result = require('../models/Result');
const User = require('../models/User');
const AIEvaluationLog = require('../models/AIEvaluationLog');
const evaluationService = require('../services/evaluationService');
const leaderboardService = require('../services/leaderboardService');
const notificationService = require('../services/notificationService');
const AppError = require('../utils/AppError');

// @desc    Start Assessment
// @route   POST /api/attempts/start/:assessmentId
// @access  Student
exports.startAssessment = async (req, res, next) => {
  try {
    let { assessmentId } = req.params;

    if (!mongoose.isValidObjectId(assessmentId)) {
      const activeAssessment = await Assessment.findOne({ isActive: true }).sort({ createdAt: -1 });
      if (!activeAssessment) {
        return next(new AppError('Assessment not found', 404));
      }
      assessmentId = activeAssessment._id.toString();
    }

    // Verify assessment exists and is active
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }
    if (!assessment.isActive) {
      return next(new AppError('This assessment is not active yet', 400));
    }

    // Check if user already attempted or has an active attempt
    let attempt = await Attempt.findOne({ student: req.user._id, assessment: assessmentId });
    
    if (attempt) {
      if (attempt.status === 'started') {
        // Return existing attempt for resume
        return res.status(200).json({
          status: 'success',
          message: 'Resuming existing assessment attempt',
          data: {
            attempt,
          },
        });
      } else {
        // Prevent retaking completed/submitted assessments
        return next(new AppError('You have already completed this assessment. Re-attempts are strictly restricted.', 400));
      }
    }

    // Initialize answer placeholders
    let initialAnswers = assessment.questions.map((q) => ({
      questionId: q.questionId,
      selectedOptionIndex: null,
      submittedCode: '',
      language: '',
      submittedText: '',
      marksObtained: 0,
      testCasesPassedCount: 0,
    }));

    // Shuffle questions if it's an MCQ assessment
    if (assessment.type === 'mcq') {
      for (let i = initialAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialAnswers[i], initialAnswers[j]] = [initialAnswers[j], initialAnswers[i]];
      }
    }

    // Create new attempt
    attempt = await Attempt.create({
      student: req.user._id,
      assessment: assessmentId,
      status: 'started',
      startedAt: new Date(),
      answers: initialAnswers,
    });

    res.status(201).json({
      status: 'success',
      message: 'Assessment attempt started successfully',
      data: {
        attempt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto Save answers during active assessment
// @route   PUT /api/attempts/:id/auto-save
// @access  Student
exports.autoSaveAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await Attempt.findById(req.params.id);

    if (!attempt) {
      return next(new AppError('Attempt session not found', 404));
    }
    if (attempt.status !== 'started') {
      return next(new AppError('This attempt has already been locked or submitted.', 400));
    }

    // Update answers
    attempt.answers = answers;
    await attempt.save();

    res.status(200).json({
      status: 'success',
      message: 'Assessment progress autosaved.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Assessment
// @route   POST /api/attempts/:id/submit
// @access  Student
exports.submitAssessment = async (req, res, next) => {
  try {
    // Atomic status transition: 'started' → 'processing'
    // This is a single DB operation. If two requests race, only ONE will find
    // a document with status='started'. The second gets null and returns 400.
    // This prevents: double testsTaken increments, double AI evaluation,
    // double Result creation, and double notifications.
    const attempt = await Attempt.findOneAndUpdate(
      { _id: req.params.id, status: 'started' },
      { $set: { status: 'processing' } },
      { new: false } // return the document BEFORE the update (original state)
    );

    if (!attempt) {
      // Either the attempt does not exist, or it was already submitted/graded/processing
      const existing = await Attempt.findById(req.params.id).select('status');
      if (!existing) {
        return next(new AppError('Attempt session not found', 404));
      }
      return next(new AppError('This assessment has already been submitted.', 400));
    }

    const assessment = await Assessment.findById(attempt.assessment);
    if (!assessment) {
      return next(new AppError('Assessment configurations not found', 404));
    }

    // 1. Capture submission stats
    const submittedAt = new Date();
    attempt.submittedAt = submittedAt;
    attempt.timeTakenSeconds = Math.round((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    // If student answers were sent along in body, update them first
    if (req.body.answers) {
      attempt.answers = req.body.answers;
    }

    // 2. Run auto grading rules (including AI Theory evaluation)
    const evaluation = await evaluationService.evaluateAttemptAnswers(assessment.questions, attempt.answers);
    
    attempt.answers = evaluation.gradedAnswers;
    attempt.totalMarksObtained = evaluation.totalMarksObtained;
    attempt.isPassed = evaluation.totalMarksObtained >= assessment.passingScore;

    // Increment testsTaken counter on the user
    await User.findByIdAndUpdate(attempt.student, { $inc: { testsTaken: 1 } });

    // 3. Persist AI evaluation audit telemetry logs
    for (const ans of evaluation.gradedAnswers) {
      if (ans.aiResult && ans.aiResult.rawAiResponse) {
        try {
          await AIEvaluationLog.create({
            attemptId: attempt._id,
            questionId: ans.questionId,
            studentId: attempt.student,
            provider: ans.aiResult.provider || 'groq',
            modelName: ans.aiResult.modelName || 'llama-3.1-8b-instant',
            promptHash: ans.aiResult.promptHash || 'unknown',
            rawAiResponse: ans.aiResult.rawAiResponse,
            parsedResult: {
              marks: ans.marksObtained,
              feedback: ans.feedback,
              confidenceScore: typeof ans.confidenceScore === 'number' ? ans.confidenceScore : (typeof ans.aiResult.confidence === 'number' ? ans.aiResult.confidence : 1.0)
            },
            tokensUsed: {
              input: ans.aiResult.usage?.promptTokens || 0,
              output: ans.aiResult.usage?.completionTokens || 0,
              total: ans.aiResult.usage?.totalTokens || 0
            },
            processingTimeMs: ans.aiResult.telemetry?.latencyMs || 0,
            needsHumanReview: !!ans.pendingReview
          });
        } catch (logErr) {
          console.warn('[AttemptController] AIEvaluationLog creation warning:', logErr.message);
        }
      }
    }

    // 4. Check if any question requires manual instructor review
    const anyPendingReview = attempt.answers.some(ans => ans.pendingReview === true);

    if (!anyPendingReview) {
      // All questions evaluated and finalized!
      attempt.status = 'graded';
      await attempt.save();

      // Create or update scorecard result
      const percentage = assessment.totalMarks > 0 
        ? Math.round((attempt.totalMarksObtained / assessment.totalMarks) * 100 * 100) / 100 
        : 0;

      await Result.findOneAndUpdate(
        { attempt: attempt._id },
        {
          student: attempt.student,
          assessment: attempt.assessment,
          attempt: attempt._id,
          totalMarks: assessment.totalMarks,
          scoreObtained: attempt.totalMarksObtained,
          percentage,
          status: attempt.isPassed ? 'pass' : 'fail',
          publishedAt: new Date()
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Recalculate assessment rankings
      await leaderboardService.recalculateLeaderboard(assessment._id);

      // Notify student
      await notificationService.createNotification(
        attempt.student,
        'Assessment Result Published',
        `Your result for "${assessment.title}" is published. Score: ${attempt.totalMarksObtained}/${assessment.totalMarks}.`,
        'result_published',
        req.user.email
      );

      return res.status(200).json({
        status: 'success',
        message: 'Assessment submitted and evaluated by AI successfully.',
        data: {
          attempt,
        },
      });
    } else {
      // Borderline or offline theory answers flagged for instructor review
      attempt.status = 'submitted';
      await attempt.save();

      // Notify instructor
      await notificationService.createNotification(
        assessment.creator,
        'Theory review submission by student',
        `Student "${req.user.name}" submitted "${assessment.title}". AI flagged some answers for human review.`,
        'notification'
      );

      return res.status(200).json({
        status: 'success',
        message: 'Assessment submitted. AI preliminary grades generated; instructor review recommended for flagged answers.',
        data: {
          attempt,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's assessment attempt history
// @route   GET /api/attempts/my-attempts
// @access  Student
exports.getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ student: req.user._id })
      .populate({
        path: 'assessment',
        populate: { path: 'subject', select: 'name code' }
      });

    const finalizedAttempts = [];

    for (let attempt of attempts) {
      if (attempt.status === 'started' && attempt.assessment) {
        const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
        const totalSeconds = attempt.assessment.duration * 60;

        if (elapsed >= totalSeconds) {
          // Proactively auto-submit expired attempts
          attempt.status = 'submitted';
          attempt.submittedAt = new Date(attempt.startedAt.getTime() + totalSeconds * 1000);
          attempt.timeTakenSeconds = totalSeconds;

          const assessment = attempt.assessment;
          const evaluation = await evaluationService.evaluateAttemptAnswers(assessment.questions, attempt.answers);
          
          attempt.answers = evaluation.gradedAnswers;
          attempt.totalMarksObtained = evaluation.totalMarksObtained;
          attempt.isPassed = evaluation.totalMarksObtained >= assessment.passingScore;

          // Increment testsTaken counter on the user
          await User.findByIdAndUpdate(attempt.student, { $inc: { testsTaken: 1 } });

          const anyPendingReview = attempt.answers.some(ans => ans.pendingReview === true);
          if (anyPendingReview) {
            attempt.status = 'submitted';
            // Do NOT increment testsTaken here — the attempt is not fully resolved.
            // testsTaken is incremented only when the result is finalized (graded).
          } else {
            attempt.status = 'graded';

            // Increment testsTaken only when result is actually finalized
            await User.findByIdAndUpdate(attempt.student, { $inc: { testsTaken: 1 } });

            // Create result scorecard
            const percentage = assessment.totalMarks > 0 
              ? Math.round((attempt.totalMarksObtained / assessment.totalMarks) * 100 * 100) / 100 
              : 0;
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

            // Recalculate leaderboard
            await leaderboardService.recalculateLeaderboard(assessment._id);
          }
          await attempt.save();
        }
      }
      finalizedAttempts.push(attempt);
    }

    // Sort by creation date descending
    finalizedAttempts.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      status: 'success',
      results: finalizedAttempts.length,
      data: {
        attempts: finalizedAttempts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student attempts for grading (by assessment)
// @route   GET /api/attempts/assessment/:assessmentId
// @access  Instructor, Admin
exports.getAssessmentAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ assessment: req.params.assessmentId })
      .populate('student', 'name email profilePicture college department batch')
      .populate({
        path: 'assessment',
        select: 'title type totalMarks passingScore'
      });

    res.status(200).json({
      status: 'success',
      results: attempts.length,
      data: {
        attempts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student attempts for instructor/admin grading roster
// @route   GET /api/attempts/all-submissions
// @access  Instructor, Admin
exports.getAllSubmissions = async (req, res, next) => {
  try {
    const attempts = await Attempt.find()
      .populate('student', 'name email profilePicture college department batch rollNo')
      .populate({
        path: 'assessment',
        populate: [
          { path: 'subject', select: 'name code' },
          { path: 'questions.questionId' }
        ]
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: attempts.length,
      data: {
        attempts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manual Grading for Theory Questions
// @route   PUT /api/attempts/:id/grade
// @access  Instructor, Admin
exports.gradeTheoryAttempt = async (req, res, next) => {
  try {
    const { gradedAnswers } = req.body; // Array of { questionId, marksObtained, feedback }
    
    const attempt = await Attempt.findById(req.params.id).populate('student');
    if (!attempt) {
      return next(new AppError('Attempt record not found', 404));
    }

    const assessment = await Assessment.findById(attempt.assessment);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    // 1. Merge grades for Theory questions supplied by the instructor
    const gradedMap = new Map();
    gradedAnswers.forEach((g) => {
      gradedMap.set(g.questionId.toString(), g);
    });

    let newTotalScore = 0;
    attempt.answers = attempt.answers.map((ans) => {
      const qIdStr = ans.questionId.toString();
      const updatedGrade = gradedMap.get(qIdStr);

      if (updatedGrade) {
        ans.marksObtained = updatedGrade.marksObtained;
        ans.feedback = updatedGrade.feedback || '';
        ans.isGraded = true;
        // Clear pendingReview for this answer now that an instructor has graded it
        ans.pendingReview = false;
      }
      
      newTotalScore += ans.marksObtained;
      return ans;
    });

    attempt.totalMarksObtained = Math.max(0, newTotalScore);
    attempt.isPassed = attempt.totalMarksObtained >= assessment.passingScore;

    // 2. Check whether any answer is still awaiting instructor review.
    //    A partial grading payload must NOT prematurely publish the Result.
    //    The attempt remains 'submitted' until every pendingReview flag is cleared.
    const stillPending = attempt.answers.some((ans) => ans.pendingReview === true);

    if (stillPending) {
      // Keep status as 'submitted'; do not create or update the Result document.
      // The instructor must return and grade the remaining flagged answers.
      attempt.status = 'submitted';
      await attempt.save();

      return res.status(200).json({
        status: 'success',
        message: 'Partial grades saved. Some answers are still pending review. Please grade all flagged answers before the result is published.',
        data: {
          attempt,
          remainingPending: attempt.answers.filter((a) => a.pendingReview).length,
        },
      });
    }

    // All answers resolved — finalize and publish
    attempt.status = 'graded';
    await attempt.save();

    // 3. Create or update scorecard result
    const percentage = Math.round((attempt.totalMarksObtained / assessment.totalMarks) * 100 * 100) / 100;
    await Result.findOneAndUpdate(
      { attempt: attempt._id },
      {
        student: attempt.student._id,
        assessment: attempt.assessment,
        attempt: attempt._id,
        totalMarks: assessment.totalMarks,
        scoreObtained: attempt.totalMarksObtained,
        percentage,
        status: attempt.isPassed ? 'pass' : 'fail',
        publishedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 4. Update leaderboard
    await leaderboardService.recalculateLeaderboard(assessment._id);

    // 5. Notify student
    await notificationService.createNotification(
      attempt.student._id,
      'Assessment Result Released',
      `Your manual grading for "${assessment.title}" is complete. Final score: ${attempt.totalMarksObtained}/${assessment.totalMarks}.`,
      'result_published',
      attempt.student.email
    );

    res.status(200).json({
      status: 'success',
      message: 'Attempt graded and results published successfully.',
      data: {
        attempt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run Code against sample test cases
// @route   POST /api/attempts/:id/run-code
// @access  Student
exports.runCode = async (req, res, next) => {
  try {
    const { questionId, submittedCode, language } = req.body;
    const CodingQuestion = require('../models/CodingQuestion');
    
    const qData = await CodingQuestion.findById(questionId);
    if (!qData) {
      return next(new AppError('Coding question not found', 404));
    }

    // Filter sample test cases
    const sampleTestCases = qData.testCases.filter((tc) => tc.isSample);
    if (sampleTestCases.length === 0) {
      return next(new AppError('No sample test cases configured for this question.', 400));
    }

    const codeExecutionService = require('../services/codeExecutionService');
    const result = await codeExecutionService.executeCode(
      submittedCode,
      language,
      sampleTestCases,
      qData.timeLimit || 2000
    );

    res.status(200).json({
      status: 'success',
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific attempt details
// @route   GET /api/attempts/:id
// @access  Protected
exports.getAttemptDetails = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: 'assessment',
        populate: [
          { path: 'subject', select: 'name code' },
          { path: 'questions.questionId' }
        ]
      });

    if (!attempt) {
      return next(new AppError('Attempt session not found', 404));
    }

    // Verify ownership
    if (
      attempt.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'instructor'
    ) {
      return next(new AppError('Unauthorized access to attempt session', 403));
    }

    // Convert to JSON and sanitize assessment questions if user is a student (hide answers/hidden tests)
    const attemptObj = attempt.toObject();

    // Sort populated assessment questions to match the persistent randomized order of answers array
    if (attemptObj.assessment && attemptObj.answers) {
      const answerQIds = attemptObj.answers.map((a) => a.questionId.toString());
      attemptObj.assessment.questions.sort((a, b) => {
        const idA = a.questionId?._id?.toString() || a.questionId?.toString();
        const idB = b.questionId?._id?.toString() || b.questionId?.toString();
        return answerQIds.indexOf(idA) - answerQIds.indexOf(idB);
      });
    }

    // Only sanitize details if attempt is still in progress ('started')
    if (req.user.role === 'student' && attemptObj.assessment && attemptObj.status === 'started') {
      attemptObj.assessment.questions = attemptObj.assessment.questions.map((qRef) => {
        const question = qRef.questionId;
        if (!question) return qRef;

        if (qRef.questionModel === 'MCQQuestion') {
          delete question.correctAnswerIndex;
        } else if (qRef.questionModel === 'CodingQuestion') {
          if (question.testCases) {
            question.testCases = question.testCases.filter((tc) => tc.isSample === true);
          }
        } else if (qRef.questionModel === 'TheoryQuestion') {
          delete question.suggestedAnswer;
        }
        return qRef;
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        attempt: attemptObj,
      },
    });
  } catch (error) {
    next(error);
  }
};
