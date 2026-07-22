const supabase = require('../config/supabase');

class SubmissionRepository {
  /**
   * Get a submission by ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*, submission_answers(*), users(full_name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find a specific student's submission for an assessment
   */
  async findByStudentAndAssessment(studentId, assessmentId) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*, submission_answers(*)')
      .eq('student_id', studentId)
      .eq('assessment_id', assessmentId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create a new submission (start attempt)
   */
  async create(data) {
    const { data: created, error } = await supabase
      .from('assessment_submissions')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created;
  }

  /**
   * Update a submission (e.g. final submit)
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Upsert answers for a submission
   */
  async upsertAnswers(answersDataArray) {
    if (!answersDataArray || answersDataArray.length === 0) return [];

    const { data, error } = await supabase
      .from('submission_answers')
      .upsert(answersDataArray, { onConflict: 'submission_id, question_id' })
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get all submissions for an assessment (Teacher view)
   */
  async findByAssessment(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*, users(full_name)')
      .eq('assessment_id', assessmentId)
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get all submissions for a student
   */
  async findByStudent(studentId) {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('*, assessments(title, max_score, type)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = new SubmissionRepository();
