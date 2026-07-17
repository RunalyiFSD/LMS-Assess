const User = require('../legacy/models/User');
const Attempt = require('../legacy/models/Attempt');
const Result = require('../legacy/models/Result');
const Assessment = require('../legacy/models/Assessment');
const Subject = require('../legacy/models/Subject');
const AppError = require('../utils/AppError');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter);
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, college, department, batch, language, experience } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new AppError('Email address is already in use', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      college,
      department,
      batch,
      language,
      experience,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile detail and performance summary
// @route   GET /api/users/profile/:id
// @access  Protected
exports.getUserProfile = async (req, res, next) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // 1. Fetch attempt and result aggregations
    const attempts = await Attempt.find({ student: studentId })
      .populate({
        path: 'assessment',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ createdAt: -1 });

    const results = await Result.find({ student: studentId })
      .populate({
        path: 'assessment',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ publishedAt: -1 });

    // 2. Compute performance metrics
    const totalPoints = results.reduce((acc, curr) => acc + curr.scoreObtained, 0);
    const completedCount = attempts.filter((a) => a.status === 'graded').length;
    const avgPercentage = results.length > 0
      ? Math.round((results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length) * 100) / 100
      : 0;
    const successRate = results.length > 0
      ? Math.round((results.filter((r) => r.status === 'pass').length / results.length) * 100 * 100) / 100
      : 0;
    const totalTimeSpent = attempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0);

    // Calculate mock rank based on overall standings
    const standings = await Result.aggregate([
      { $group: { _id: '$student', score: { $sum: '$scoreObtained' } } },
      { $sort: { score: -1 } },
    ]);
    const studentIndex = standings.findIndex((s) => s._id.toString() === studentId.toString());
    const globalRank = studentIndex !== -1 ? studentIndex + 1 : standings.length + 1;

    // 3. Compute subject-wise analytics progress bars
    const subjectStatsMap = new Map();
    results.forEach((resItem) => {
      const sub = resItem.assessment.subject;
      if (sub) {
        if (!subjectStatsMap.has(sub.code)) {
          subjectStatsMap.set(sub.code, { name: sub.name, code: sub.code, totalScore: 0, maxScore: 0, count: 0 });
        }
        const sData = subjectStatsMap.get(sub.code);
        sData.totalScore += resItem.scoreObtained;
        sData.maxScore += resItem.totalMarks;
        sData.count += 1;
      }
    });

    const subjectPerformance = Array.from(subjectStatsMap.values()).map((s) => ({
      subjectName: s.name,
      subjectCode: s.code,
      averagePercentage: s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0,
    }));

    // 4. Badges / Achievements Logic
    const achievements = [];
    if (globalRank <= 3 && totalPoints > 0) achievements.push({ id: 'top_performer', title: 'Top Performer', description: 'Ranked in the top 3 globally.' });
    
    const codingTests = results.filter((r) => r.assessment.type === 'coding');
    const highCoding = codingTests.filter((r) => r.percentage >= 80).length;
    if (highCoding >= 2) achievements.push({ id: 'coding_expert', title: 'Coding Expert', description: 'Scored 80%+ in 2+ coding assessments.' });

    const mcqTests = results.filter((r) => r.assessment.type === 'mcq');
    const highMcq = mcqTests.filter((r) => r.percentage >= 90).length;
    if (highMcq >= 2) achievements.push({ id: 'mcq_master', title: 'MCQ Master', description: 'Scored 90%+ in 2+ MCQ assessments.' });

    const theoryTests = results.filter((r) => r.assessment.type === 'theory');
    const highTheory = theoryTests.filter((r) => r.percentage >= 85).length;
    if (highTheory >= 2) achievements.push({ id: 'theory_champion', title: 'Theory Champion', description: 'Scored 85%+ in 2+ theory assessments.' });

    const perfectCount = results.filter((r) => r.percentage === 100).length;
    if (perfectCount >= 1) achievements.push({ id: 'perfect_score', title: 'Perfect Score', description: 'Scored 100% on an assessment.' });

    if (totalTimeSpent > 0 && results.filter(r => r.status === 'pass').length > 0) {
      achievements.push({ id: 'fast_solver', title: 'Fast Solver', description: 'Passed an assessment well within the timer.' });
    }
    // Always grant starter badge
    achievements.push({ id: 'streak', title: '7-Day Streak', description: 'Logged in and practiced regularly.' });

    res.status(200).json({
      status: 'success',
      data: {
        profile: {
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture,
          college: student.college,
          department: student.department,
          batch: student.batch,
          bio: student.bio,
        },
        summary: {
          globalRank,
          totalPoints,
          testsTaken: student.testsTaken || 0,
          assessmentsAttempted: attempts.length,
          assessmentsCompleted: completedCount,
          averagePercentage: avgPercentage,
          successRate,
          totalTimeSpent,
        },
        subjectPerformance,
        assessmentHistory: results.map((r) => ({
          assessmentName: r.assessment.title,
          subject: r.assessment.subject.name,
          assessmentType: r.assessment.type,
          date: r.publishedAt,
          marksObtained: r.scoreObtained,
          totalMarks: r.totalMarks,
          percentage: r.percentage,
          status: r.status,
        })),
        achievements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed chart configurations for public profile page
// @route   GET /api/users/profile/:id/analytics
// @access  Protected
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    const results = await Result.find({ student: studentId })
      .populate({
        path: 'assessment',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ publishedAt: 1 });

    // 1. Weekly Performance Chart (last 7 assessments or mock days)
    const weeklyPerformance = results.slice(-7).map((r, i) => ({
      name: `Test ${i + 1}`,
      score: r.percentage,
    }));

    // 2. Monthly Performance Chart (mock groupings by month name)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    results.forEach((r) => {
      const monthIndex = new Date(r.publishedAt).getMonth();
      const monthName = months[monthIndex];
      if (!monthlyMap[monthName]) monthlyMap[monthName] = { scoreSum: 0, count: 0 };
      monthlyMap[monthName].scoreSum += r.percentage;
      monthlyMap[monthName].count += 1;
    });
    const monthlyPerformance = Object.keys(monthlyMap).map((m) => ({
      name: m,
      score: Math.round(monthlyMap[m].scoreSum / monthlyMap[m].count),
    }));

    // 3. Subject-wise Comparison Chart (Student performance vs class average)
    // Gather all results to find averages
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
      const subId = r.assessment.subject.toString();
      if (!studentAvgMap[subId]) studentAvgMap[subId] = { scoreSum: 0, count: 0 };
      studentAvgMap[subId].scoreSum += r.percentage;
      studentAvgMap[subId].count += 1;
    });

    // Populate comparison with subject codes
    const subjects = await Subject.find().select('name code');
    const subjectComparison = subjects.map((sub) => {
      const subIdStr = sub._id.toString();
      const studentAvg = studentAvgMap[subIdStr] ? Math.round(studentAvgMap[subIdStr].scoreSum / studentAvgMap[subIdStr].count) : 0;
      const classAvg = classAvgMap[subIdStr] ? Math.round(classAvgMap[subIdStr].scoreSum / classAvgMap[subIdStr].count) : 0;
      return {
        subject: sub.code,
        student: studentAvg,
        average: classAvg,
      };
    }).filter(item => item.student > 0 || item.average > 0); // only return active comparison subjects

    // 4. Problem Solved Pie Chart (MCQ questions vs Coding questions vs Theory questions)
    const mcqGradedCount = results.filter((r) => r.assessment.type === 'mcq').length;
    const codingGradedCount = results.filter((r) => r.assessment.type === 'coding').length;
    const theoryGradedCount = results.filter((r) => r.assessment.type === 'theory').length;

    const problemsSolved = [
      { name: 'MCQ Assessments', value: mcqGradedCount },
      { name: 'Coding Assessments', value: codingGradedCount },
      { name: 'Theory Assessments', value: theoryGradedCount },
    ].filter(item => item.value > 0);

    // 5. Submission Analysis (Pass vs Fail ratio)
    const passedCount = results.filter((r) => r.status === 'pass').length;
    const failedCount = results.filter((r) => r.status === 'fail').length;

    const submissionAnalysis = [
      { name: 'Passed', value: passedCount },
      { name: 'Failed', value: failedCount },
    ];

    // 6. Skill Analysis Bar Chart (Core metrics: MCQ, Coding, Theory proficiency out of 100)
    const mcqAvg = mcqGradedCount > 0 ? results.filter(r => r.assessment.type === 'mcq').reduce((acc, curr) => acc + curr.percentage, 0) / mcqGradedCount : 0;
    const codingAvg = codingGradedCount > 0 ? results.filter(r => r.assessment.type === 'coding').reduce((acc, curr) => acc + curr.percentage, 0) / codingGradedCount : 0;
    const theoryAvg = theoryGradedCount > 0 ? results.filter(r => r.assessment.type === 'theory').reduce((acc, curr) => acc + curr.percentage, 0) / theoryGradedCount : 0;

    const skillAnalysis = [
      { name: 'MCQ Accuracy', score: Math.round(mcqAvg) },
      { name: 'Coding Logic', score: Math.round(codingAvg) },
      { name: 'Theory Mastery', score: Math.round(theoryAvg) },
    ];

    res.status(200).json({
      status: 'success',
      data: {
        weeklyPerformance,
        monthlyPerformance,
        subjectComparison,
        problemsSolved,
        submissionAnalysis,
        skillAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile details
// @route   PUT /api/users/profile
// @access  Protected
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, college, department, batch, bio, profilePicture, language, experience } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          college,
          department,
          batch,
          bio,
          profilePicture,
          language,
          experience
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          college: updatedUser.college,
          department: updatedUser.department,
          batch: updatedUser.batch,
          bio: updatedUser.bio,
          profilePicture: updatedUser.profilePicture,
          language: updatedUser.language,
          experience: updatedUser.experience
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
