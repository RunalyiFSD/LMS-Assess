const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * AttemptRepository
 *
 * DEFERRED: Sprint 3/4
 * Full implementation will track individual student assessment attempts,
 * including start time, time taken, and per-attempt state.
 *
 * The `assessment_submissions` table in Supabase currently serves
 * as the primary submission tracking store. This repository will
 * wrap additional attempt-level granularity when needed.
 */
class AttemptRepository {
  /**
   * Find attempts by student ID.
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  async findByStudent(studentId) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(`Error fetching attempts: ${error.message}`, 500);
    return data || [];
  }

  /**
   * Find attempts by assessment ID.
   * @param {string} assessmentId
   * @returns {Promise<Array>}
   */
  async findByAssessment(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*, users(full_name, email)')
      .eq('assessment_id', assessmentId)
      .order('score', { ascending: false });

    if (error) throw new AppError(`Error fetching attempts: ${error.message}`, 500);
    return data || [];
  }
}

module.exports = new AttemptRepository();
