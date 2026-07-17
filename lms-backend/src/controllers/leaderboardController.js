const Leaderboard = require('../legacy/models/Leaderboard');
const Result = require('../legacy/models/Result');
const User = require('../legacy/models/User');
const Assessment = require('../legacy/models/Assessment');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// @desc    Get assessment-specific leaderboard
// @route   GET /api/leaderboard/:assessmentId
// @access  Protected
exports.getAssessmentLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Leaderboard.findOne({ assessment: req.params.assessmentId })
      .populate('rankings.student', 'name email profilePicture college department batch')
      .populate('assessment', 'title type');

    if (!leaderboard) {
      return res.status(200).json({
        status: 'success',
        data: {
          assessment: req.params.assessmentId,
          rankings: [],
        },
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global leaderboard (aggregated student performance list)
// @route   GET /api/leaderboard/global
// @access  Protected
exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { search, subject, batch, type, sortBy, page = 1, limit = 10 } = req.query;

    const skipVal = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Initial match stage for filtering results by assessment constraints
    const matchStage = {};
    
    // If subject or type filter is present, we must lookup assessments first
    if (subject || type) {
      const assessmentQuery = {};
      if (subject) assessmentQuery.subject = new mongoose.Types.ObjectId(subject);
      if (type) assessmentQuery.type = type;
      
      const matchedAssessments = await Assessment.find(assessmentQuery).select('_id');
      const assessmentIds = matchedAssessments.map(a => a._id);
      matchStage.assessment = { $in: assessmentIds };
    }

    // Aggregate overall standings
    const pipeline = [
      // 1. Match results by assessment criteria if any
      Object.keys(matchStage).length ? { $match: matchStage } : { $match: {} },
      
      // 2. Group by student
      {
        $group: {
          _id: '$student',
          totalScore: { $sum: '$scoreObtained' },
          assessmentsCompleted: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
          latestActivity: { $max: '$publishedAt' },
        },
      },
      
      // 3. Lookup user info
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
    ];

    // 4. Handle student filters (batch, name search)
    const studentMatch = {};
    if (batch) {
      studentMatch['studentInfo.batch'] = batch;
    }
    if (search) {
      studentMatch['studentInfo.name'] = { $regex: search, $options: 'i' };
    }

    if (Object.keys(studentMatch).length) {
      pipeline.push({ $match: studentMatch });
    }

    // 5. Handle sorting configurations
    let sortStage = { totalScore: -1 }; // default
    if (sortBy === 'completed') {
      sortStage = { assessmentsCompleted: -1, totalScore: -1 };
    } else if (sortBy === 'latest') {
      sortStage = { latestActivity: -1 };
    } else if (sortBy === 'percentage') {
      sortStage = { avgPercentage: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Copy pipeline for count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Result.aggregate(countPipeline);
    const totalRecords = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination stages
    pipeline.push({ $skip: skipVal });
    pipeline.push({ $limit: limitVal });

    // Execute aggregation
    const rankingsRaw = await Result.aggregate(pipeline);

    // Format ranks with pagination offsets
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

// @desc    Get top 5 students for Landing Page / Lobby
// @route   GET /api/leaderboard/top-five
// @access  Protected
exports.getTopFiveStudents = async (req, res, next) => {
  try {
    // Run simple aggregate returning top 5 performers overall
    const topFive = await Result.aggregate([
      {
        $group: {
          _id: '$student',
          totalScore: { $sum: '$scoreObtained' },
          assessmentsCompleted: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      { $sort: { totalScore: -1 } },
      { $limit: 5 },
    ]);

    const formatted = topFive.map((record, index) => {
      // Assign badges/medals based on rank
      let badge = 'Bronze Solver';
      if (index === 0) badge = 'Gold Medalist';
      else if (index === 1) badge = 'Silver Medalist';
      else if (index === 2) badge = 'Bronze Medalist';
      else if (index === 3) badge = 'Coding Ninja';

      return {
        rank: index + 1,
        name: record.studentInfo.name,
        profilePicture: record.studentInfo.profilePicture,
        totalScore: record.totalScore,
        assessmentsCompleted: record.assessmentsCompleted,
        badge,
        studentId: record.studentInfo._id,
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        rankings: formatted,
      },
    });
  } catch (error) {
    next(error);
  }
};
