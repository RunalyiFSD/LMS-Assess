const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

// @desc    Get assessment-specific leaderboard
// @route   GET /api/v1/leaderboard/:assessmentId
// @access  Protected
// MIGRATED: Uses Supabase assessment_submissions table.
//           Full recalculation logic (time-based tie-breaking) deferred to Sprint 3.
exports.getAssessmentLeaderboard = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;

    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('student_id, score, submitted_at, users(full_name, email, avatar_url)')
      .eq('assessment_id', assessmentId)
      .in('status', ['submitted', 'evaluated'])
      .order('score', { ascending: false });

    if (error) {
      return next(new AppError(`Failed to fetch leaderboard: ${error.message}`, 500));
    }

    const rankings = (data || []).map((row, idx) => ({
      rank: idx + 1,
      student_id: row.student_id,
      student: row.users || null,
      score: row.score || 0,
      submitted_at: row.submitted_at,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        assessment_id: assessmentId,
        rankings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global leaderboard (aggregated student performance)
// @route   GET /api/v1/leaderboard/global
// @access  Protected
// MIGRATED: Aggregates from Supabase assessment_submissions.
//           Advanced filters (subject, batch, type) deferred to Sprint 3 Supabase views/RPCs.
exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Fetch all submitted/evaluated submissions with user info
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('student_id, score, submitted_at, users(full_name, email, avatar_url)')
      .in('status', ['submitted', 'evaluated']);

    if (error) {
      return next(new AppError(`Failed to fetch global leaderboard: ${error.message}`, 500));
    }

    // Aggregate by student in application layer
    // NOTE: Sprint 3 will move this to a Supabase materialized view or RPC for performance.
    const studentMap = {};
    (data || []).forEach((row) => {
      const sid = row.student_id;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student_id: sid,
          student: row.users || null,
          totalScore: 0,
          assessmentsCompleted: 0,
          latestActivity: null,
        };
      }
      studentMap[sid].totalScore += row.score || 0;
      studentMap[sid].assessmentsCompleted += 1;
      if (!studentMap[sid].latestActivity || row.submitted_at > studentMap[sid].latestActivity) {
        studentMap[sid].latestActivity = row.submitted_at;
      }
    });

    const sorted = Object.values(studentMap).sort((a, b) => b.totalScore - a.totalScore);
    const totalRecords = sorted.length;
    const paginated = sorted.slice(offset, offset + limitNum).map((s, idx) => ({
      rank: offset + idx + 1,
      ...s,
    }));

    res.status(200).json({
      status: 'success',
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalResults: totalRecords,
      data: {
        rankings: paginated,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top 5 students for Landing Page / Lobby
// @route   GET /api/v1/leaderboard/top-five
// @access  Protected
// MIGRATED: Aggregates from Supabase assessment_submissions.
exports.getTopFiveStudents = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('student_id, score, users(full_name, email, avatar_url)')
      .in('status', ['submitted', 'evaluated']);

    if (error) {
      return next(new AppError(`Failed to fetch top students: ${error.message}`, 500));
    }

    // Aggregate by student
    const studentMap = {};
    (data || []).forEach((row) => {
      const sid = row.student_id;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student_id: sid,
          student: row.users || null,
          totalScore: 0,
          assessmentsCompleted: 0,
        };
      }
      studentMap[sid].totalScore += row.score || 0;
      studentMap[sid].assessmentsCompleted += 1;
    });

    const badges = ['Gold Medalist', 'Silver Medalist', 'Bronze Medalist', 'Coding Ninja', 'Bronze Solver'];

    const topFive = Object.values(studentMap)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
      .map((s, idx) => ({
        rank: idx + 1,
        name: s.student?.full_name || 'Unknown',
        avatar_url: s.student?.avatar_url || null,
        totalScore: s.totalScore,
        assessmentsCompleted: s.assessmentsCompleted,
        badge: badges[idx] || 'Bronze Solver',
        student_id: s.student_id,
      }));

    res.status(200).json({
      status: 'success',
      data: {
        rankings: topFive,
      },
    });
  } catch (error) {
    next(error);
  }
};
