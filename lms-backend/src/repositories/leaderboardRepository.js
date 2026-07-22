const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * LeaderboardRepository
 *
 * DEFERRED: Sprint 3/4
 * Full implementation will provide cached/materialized leaderboard views.
 * Currently delegates to assessment_submissions table for live aggregation.
 *
 * In Sprint 3, a dedicated `leaderboards` materialized view or table will be
 * created in Supabase, and this repository will manage CRUD against it.
 */
class LeaderboardRepository {
  /**
   * Get leaderboard rankings for a specific assessment.
   * @param {string} assessmentId
   * @returns {Promise<Array>}
   */
  async findByAssessment(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('student_id, score, submitted_at, users(full_name, email, avatar_url)')
      .eq('assessment_id', assessmentId)
      .in('status', ['submitted', 'evaluated'])
      .order('score', { ascending: false });

    if (error) throw new AppError(`Error fetching leaderboard: ${error.message}`, 500);
    return data || [];
  }

  /**
   * Get global leaderboard (all students, all assessments).
   * @returns {Promise<Array>}
   */
  async findGlobal() {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('student_id, score, submitted_at, users(full_name, email, avatar_url)')
      .in('status', ['submitted', 'evaluated']);

    if (error) throw new AppError(`Error fetching global leaderboard: ${error.message}`, 500);
    return data || [];
  }
}

module.exports = new LeaderboardRepository();
