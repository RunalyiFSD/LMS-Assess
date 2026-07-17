const { supabase } = require('../config/supabase');

class AssessmentRepository {
  /**
   * Get all assessments based on filters
   */
  async findAll(filters = {}) {
    let query = supabase
      .from('assessments')
      .select('*, courses(title), users!assessments_teacher_id_fkey(full_name)');

    if (filters.course_id) query = query.eq('course_id', filters.course_id);
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get an assessment by ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*, courses(title, status), users!assessments_teacher_id_fkey(full_name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create a new assessment
   */
  async create(data) {
    const { data: created, error } = await supabase
      .from('assessments')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return created;
  }

  /**
   * Update an assessment
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Delete an assessment
   */
  async delete(id) {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

module.exports = new AssessmentRepository();
