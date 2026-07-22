const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * Fetches and structures the leaderboard for a specific assessment.
 *
 * MIGRATED: Now queries Supabase assessment_submissions table.
 * Advanced tie-breaking (time-based) and caching are deferred to Sprint 3.
 *
 * @param {string} assessmentId - UUID of the assessment
 * @returns {Promise<Object>} Structured leaderboard object
 */
exports.recalculateLeaderboard = async (assessmentId) => {
  try {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('student_id, score, submitted_at, users(full_name, email, avatar_url)')
      .eq('assessment_id', assessmentId)
      .in('status', ['submitted', 'evaluated'])
      .order('score', { ascending: false });

    if (error) {
      throw new AppError(`Failed to calculate leaderboard: ${error.message}`, 500);
    }

    const rankings = (data || []).map((row, idx) => ({
      rank: idx + 1,
      student: row.users || null,
      student_id: row.student_id,
      score: row.score || 0,
      submitted_at: row.submitted_at,
    }));

    return {
      assessment_id: assessmentId,
      rankings,
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error recalculating leaderboard for assessment ${assessmentId}:`, error);
    throw error;
  }
};
