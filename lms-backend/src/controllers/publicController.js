const User = require('../models/User');
const Result = require('../models/Result');
const Attempt = require('../models/Attempt');
const Subject = require('../models/Subject');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get top 5 students by total score — PUBLIC, no auth required
// @route   GET /api/public/top-five
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.getPublicTopFive = async (req, res, next) => {
  try {
    const topFive = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $lookup: {
          from: 'results',
          localField: '_id',
          foreignField: 'student',
          as: 'studentResults',
        },
      },
      {
        $addFields: {
          totalScore: { $sum: '$studentResults.scoreObtained' },
          assessmentsCompleted: { $size: '$studentResults' },
        },
      },
      {
        $project: {
          studentInfo: '$$ROOT',
          totalScore: 1,
          assessmentsCompleted: 1,
        },
      },
      { $sort: { totalScore: -1, assessmentsCompleted: -1 } },
      { $limit: 5 },
    ]);

    const badgeLabels = ['Gold Medalist', 'Silver Medalist', 'Bronze Medalist', 'Rising Star', 'Top Performer'];

    const rankings = topFive.map((record, i) => ({
      rank: i + 1,
      studentId: record.studentInfo._id,
      name: record.studentInfo.name,
      profilePicture: record.studentInfo.profilePicture || '',
      college: record.studentInfo.college || '',
      department: record.studentInfo.department || '',
      batch: record.studentInfo.batch || '',
      videoBioUrl: record.studentInfo.videoBioUrl || '',
      totalScore: record.totalScore || 0,
      assessmentsCompleted: record.assessmentsCompleted || 0,
      badge: badgeLabels[i] || 'Star Performer',
    }));

    res.status(200).json({ status: 'success', data: { rankings } });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get global leaderboard with filters — PUBLIC, no auth required
// @route   GET /api/public/leaderboard
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.getPublicLeaderboard = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Assessment = require('../models/Assessment');
    const { search, subject, batch, type, sortBy, page = 1, limit = 10 } = req.query;
    const skipVal = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    const matchStage = {};
    if (subject || type) {
      const assessmentQuery = {};
      if (subject && mongoose.Types.ObjectId.isValid(subject)) {
        assessmentQuery.subject = new mongoose.Types.ObjectId(subject);
      }
      if (type) assessmentQuery.type = type;
      const matchedAssessments = await Assessment.find(assessmentQuery).select('_id');
      matchStage.assessment = { $in: matchedAssessments.map((a) => a._id) };
    }

    const studentMatch = { role: 'student' };
    if (batch) studentMatch.batch = batch;
    if (search) studentMatch.name = { $regex: search, $options: 'i' };

    const pipeline = [
      { $match: studentMatch },
      {
        $lookup: {
          from: 'results',
          let: { studentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$student', '$$studentId'] },
                ...(Object.keys(matchStage).length ? matchStage : {}),
              },
            },
          ],
          as: 'studentResults',
        },
      },
      {
        $addFields: {
          totalScore: { $sum: '$studentResults.scoreObtained' },
          assessmentsCompleted: { $size: '$studentResults' },
          avgPercentage: { $ifNull: [{ $avg: '$studentResults.percentage' }, 0] },
          latestActivity: { $max: '$studentResults.publishedAt' },
        },
      },
      {
        $project: {
          studentInfo: '$$ROOT',
          totalScore: 1,
          assessmentsCompleted: 1,
          avgPercentage: 1,
          latestActivity: 1,
        },
      },
    ];

    let sortStage = { totalScore: -1 };
    if (sortBy === 'completed') sortStage = { assessmentsCompleted: -1, totalScore: -1 };
    else if (sortBy === 'latest') sortStage = { latestActivity: -1 };
    else if (sortBy === 'percentage') sortStage = { avgPercentage: -1 };
    pipeline.push({ $sort: sortStage });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await User.aggregate(countPipeline);
    const totalRecords = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: skipVal });
    pipeline.push({ $limit: limitVal });

    const rankingsRaw = await User.aggregate(pipeline);

    const rankings = rankingsRaw.map((record, index) => ({
      student: {
        _id: record.studentInfo._id,
        name: record.studentInfo.name,
        email: record.studentInfo.email,
        profilePicture: record.studentInfo.profilePicture,
        college: record.studentInfo.college,
        department: record.studentInfo.department,
        batch: record.studentInfo.batch,
        bio: record.studentInfo.bio,
      },
      totalScore: record.totalScore,
      assessmentsCompleted: record.assessmentsCompleted,
      avgPercentage: Math.round(record.avgPercentage * 100) / 100,
      latestActivity: record.latestActivity,
      rank: skipVal + index + 1,
    }));

    res.status(200).json({
      status: 'success',
      page: parseInt(page),
      limit: limitVal,
      totalPages: Math.ceil(totalRecords / limitVal),
      totalResults: totalRecords,
      data: {
        rankings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a student's public profile — PUBLIC, no auth required
// @route   GET /api/public/profile/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.getPublicProfile = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Safe fields only — no email, password, tokens
    const student = await User.findById(studentId).select(
      'name profilePicture college department batch bio videoBioUrl testsTaken createdAt'
    );
    if (!student) return next(new AppError('Student not found', 404));

    // Attempts for time tracking
    const attempts = await Attempt.find({ student: studentId })
      .populate({ path: 'assessment', populate: { path: 'subject', select: 'name code' } })
      .sort({ createdAt: -1 });

    // Results for scoring
    const results = await Result.find({ student: studentId })
      .populate({ path: 'assessment', populate: { path: 'subject', select: 'name code' } })
      .sort({ publishedAt: -1 });

    // ── Summary metrics ────────────────────────────────────────────────────
    const totalPoints = results.reduce((acc, r) => acc + r.scoreObtained, 0);
    const avgPercentage = results.length > 0
      ? Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / results.length) * 100) / 100
      : 0;
    const passCount = results.filter((r) => r.status === 'pass').length;
    const successRate = results.length > 0 ? Math.round((passCount / results.length) * 10000) / 100 : 0;
    const totalTimeSpent = attempts.reduce((acc, a) => acc + (a.timeTakenSeconds || 0), 0);
    const completedCount = attempts.filter((a) => a.status === 'graded').length;

    // Global rank
    const standings = await Result.aggregate([
      { $group: { _id: '$student', score: { $sum: '$scoreObtained' } } },
      { $sort: { score: -1 } },
    ]);
    const rankIdx = standings.findIndex((s) => s._id.toString() === studentId.toString());
    const globalRank = rankIdx !== -1 ? rankIdx + 1 : standings.length + 1;

    // ── Subject performance ────────────────────────────────────────────────
    const subjectStatsMap = new Map();
    results.forEach((r) => {
      const sub = r.assessment?.subject;
      if (!sub) return;
      if (!subjectStatsMap.has(sub.code)) {
        subjectStatsMap.set(sub.code, { name: sub.name, code: sub.code, totalScore: 0, maxScore: 0, count: 0 });
      }
      const d = subjectStatsMap.get(sub.code);
      d.totalScore += r.scoreObtained;
      d.maxScore += r.totalMarks;
      d.count += 1;
    });
    const subjectPerformance = Array.from(subjectStatsMap.values()).map((s) => ({
      subjectName: s.name,
      subjectCode: s.code,
      assessmentCount: s.count,
      averagePercentage: s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0,
    }));

    // ── Badges / Achievements ─────────────────────────────────────────────
    const achievements = [];
    if (globalRank <= 3 && totalPoints > 0) achievements.push({ id: 'top_performer', title: 'Top Performer', description: 'Ranked in the top 3 globally.', icon: 'trophy' });
    if (results.filter((r) => r.assessment.type === 'coding' && r.percentage >= 80).length >= 2)
      achievements.push({ id: 'coding_expert', title: 'Coding Expert', description: 'Scored 80%+ in 2+ coding assessments.', icon: 'code' });
    if (results.filter((r) => r.assessment.type === 'mcq' && r.percentage >= 90).length >= 2)
      achievements.push({ id: 'mcq_master', title: 'MCQ Master', description: 'Scored 90%+ in 2+ MCQ assessments.', icon: 'check' });
    if (results.filter((r) => r.assessment.type === 'theory' && r.percentage >= 85).length >= 2)
      achievements.push({ id: 'theory_champion', title: 'Theory Champion', description: 'Scored 85%+ in 2+ theory assessments.', icon: 'book' });
    if (results.some((r) => r.percentage === 100))
      achievements.push({ id: 'perfect_score', title: 'Perfect Score', description: 'Scored 100% on an assessment.', icon: 'star' });
    if (results.length >= 5)
      achievements.push({ id: 'dedicated', title: 'Dedicated Learner', description: 'Completed 5+ assessments.', icon: 'award' });
    achievements.push({ id: 'streak', title: '7-Day Streak', description: 'Logged in and practiced regularly.', icon: 'zap' });

    // ── Recent activity timeline ──────────────────────────────────────────
    const recentActivity = results.slice(0, 10).map((r) => ({
      type: 'assessment',
      label: `Completed "${r.assessment.title}"`,
      subject: r.assessment?.subject?.name || '',
      result: r.status,
      percentage: r.percentage,
      date: r.publishedAt,
    }));

    // ── Assessment history ────────────────────────────────────────────────
    const assessmentHistory = results.map((r) => ({
      assessmentName: r.assessment.title,
      subject: r.assessment?.subject?.name || '',
      assessmentType: r.assessment.type,
      date: r.publishedAt,
      marksObtained: r.scoreObtained,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      status: r.status,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        profile: {
          _id: student._id,
          name: student.name,
          profilePicture: student.profilePicture,
          college: student.college,
          department: student.department,
          batch: student.batch,
          bio: student.bio,
          videoBioUrl: student.videoBioUrl,
          memberSince: student.createdAt,
        },
        summary: {
          globalRank,
          totalPoints,
          assessmentsAttempted: attempts.length,
          assessmentsCompleted: completedCount,
          averagePercentage: avgPercentage,
          successRate,
          passCount,
          failCount: results.length - passCount,
          totalTimeSpent,
          learningHours: Math.round(totalTimeSpent / 3600 * 10) / 10,
        },
        subjectPerformance,
        assessmentHistory,
        achievements,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get chart analytics for a student — PUBLIC, no auth required
// @route   GET /api/public/profile/:id/analytics
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.getPublicAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    const results = await Result.find({ student: studentId })
      .populate({ path: 'assessment', populate: { path: 'subject', select: 'name code' } })
      .sort({ publishedAt: 1 });

    // 1. Weekly (last 7 results)
    const weeklyPerformance = results.slice(-7).map((r, i) => ({
      name: `Test ${i + 1}`,
      score: r.percentage,
    }));

    // 2. Monthly averages
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    results.forEach((r) => {
      const m = months[new Date(r.publishedAt).getMonth()];
      if (!monthlyMap[m]) monthlyMap[m] = { scoreSum: 0, count: 0 };
      monthlyMap[m].scoreSum += r.percentage;
      monthlyMap[m].count += 1;
    });
    const monthlyPerformance = Object.keys(monthlyMap).map((m) => ({
      name: m,
      score: Math.round(monthlyMap[m].scoreSum / monthlyMap[m].count),
    }));

    // 3. Subject comparison vs class average
    const allResults = await Result.find().populate('assessment');
    const classAvgMap = {};
    allResults.forEach((r) => {
      const subId = r.assessment.subject.toString();
      if (!classAvgMap[subId]) classAvgMap[subId] = { scoreSum: 0, count: 0 };
      classAvgMap[subId].scoreSum += r.percentage;
      classAvgMap[subId].count += 1;
    });
    const studentAvgMap = {};
    results.forEach((r) => {
      const sub = r.assessment?.subject;
      if (!sub) return;
      const subId = (sub._id || sub).toString();
      if (!studentAvgMap[subId]) studentAvgMap[subId] = { scoreSum: 0, count: 0 };
      studentAvgMap[subId].scoreSum += r.percentage;
      studentAvgMap[subId].count += 1;
    });
    const subjects = await Subject.find().select('name code');
    const subjectComparison = subjects.map((sub) => {
      const id = sub._id.toString();
      return {
        subject: sub.code,
        student: studentAvgMap[id] ? Math.round(studentAvgMap[id].scoreSum / studentAvgMap[id].count) : 0,
        average: classAvgMap[id] ? Math.round(classAvgMap[id].scoreSum / classAvgMap[id].count) : 0,
      };
    }).filter((i) => i.student > 0 || i.average > 0);

    // 4. Assessment type breakdown
    const mcqCount = results.filter((r) => r.assessment.type === 'mcq').length;
    const codingCount = results.filter((r) => r.assessment.type === 'coding').length;
    const theoryCount = results.filter((r) => r.assessment.type === 'theory').length;
    const problemsSolved = [
      { name: 'MCQ', value: mcqCount },
      { name: 'Coding', value: codingCount },
      { name: 'Theory', value: theoryCount },
    ].filter((i) => i.value > 0);

    // 5. Pass vs Fail
    const submissionAnalysis = [
      { name: 'Passed', value: results.filter((r) => r.status === 'pass').length },
      { name: 'Failed', value: results.filter((r) => r.status === 'fail').length },
    ];

    // 6. Skill analysis
    const avg = (arr, field) => arr.length > 0 ? Math.round(arr.reduce((a, r) => a + r.percentage, 0) / arr.length) : 0;
    const skillAnalysis = [
      { name: 'MCQ Accuracy', score: avg(results.filter((r) => r.assessment.type === 'mcq')) },
      { name: 'Coding Logic', score: avg(results.filter((r) => r.assessment.type === 'coding')) },
      { name: 'Theory Mastery', score: avg(results.filter((r) => r.assessment.type === 'theory')) },
    ];

    res.status(200).json({
      status: 'success',
      data: { weeklyPerformance, monthlyPerformance, subjectComparison, problemsSolved, submissionAnalysis, skillAnalysis },
    });
  } catch (error) {
    next(error);
  }
};
