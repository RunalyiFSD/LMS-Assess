const Leaderboard = require('../models/Leaderboard');
const Result = require('../models/Result');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
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

    const studentMatch = { role: 'student' };
    if (batch) {
      studentMatch.batch = batch;
    }
    if (search) {
      studentMatch.name = { $regex: search, $options: 'i' };
    }

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
                ...(Object.keys(matchStage).length ? matchStage : {})
              } 
            }
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
        }
      },
      {
        $project: {
          studentInfo: '$$ROOT',
          totalScore: 1,
          assessmentsCompleted: 1,
          avgPercentage: 1,
          latestActivity: 1
        }
      }
    ];

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
    const countResult = await User.aggregate(countPipeline);
    const totalRecords = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination stages
    pipeline.push({ $skip: skipVal });
    pipeline.push({ $limit: limitVal });

    // Execute aggregation
    const rankingsRaw = await User.aggregate(pipeline);

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
    
    console.log("Global Leaderboard hit!", rankings.length, "results found. req.query:", req.query);

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
    // Run aggregate from users to include top 5 overall (even 0 points if few users)
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
        }
      },
      {
        $project: {
          studentInfo: '$$ROOT',
          totalScore: 1,
          assessmentsCompleted: 1,
        }
      },
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
