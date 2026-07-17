const { supabase } = require('../config/supabase');

class CourseRepository {
  // ===================== COURSES =====================

  /**
   * Find all courses (optionally filtered by status or teacher)
   * @param {Object} filters 
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    let query = supabase
      .from('courses')
      .select('*, departments(name), users!courses_teacher_id_fkey(full_name, email)')
      .is('deleted_at', null);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters.department_id) query = query.eq('department_id', filters.department_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find course by ID
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('courses')
      .select('*, departments(name), users!courses_teacher_id_fkey(full_name, email)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create a new course
   * @param {Object} courseData 
   * @returns {Promise<Object>}
   */
  async create(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update course
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Soft delete course
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('courses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // ===================== ENROLLMENTS =====================

  /**
   * Enroll a student in a course
   * @param {string} studentId 
   * @param {string} courseId 
   * @returns {Promise<Object>}
   */
  async enrollStudent(studentId, courseId) {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert([{ student_id: studentId, course_id: courseId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get all active enrollments for a student
   * @param {string} studentId 
   * @returns {Promise<Array>}
   */
  async findStudentEnrollments(studentId) {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('*, courses(*, departments(name), users!courses_teacher_id_fkey(full_name))')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Unenroll or update enrollment status
   * @param {string} studentId 
   * @param {string} courseId 
   * @param {string} status 'dropped' | 'completed'
   */
  async updateEnrollmentStatus(studentId, courseId, status) {
    const { data, error } = await supabase
      .from('course_enrollments')
      .update({ status })
      .match({ student_id: studentId, course_id: courseId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // ===================== MATERIALS =====================

  /**
   * Get materials for a course
   * @param {string} courseId 
   * @returns {Promise<Array>}
   */
  async findCourseMaterials(courseId) {
    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Add a material to a course
   * @param {Object} materialData 
   * @returns {Promise<Object>}
   */
  async addMaterial(materialData) {
    const { data, error } = await supabase
      .from('course_materials')
      .insert([materialData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Remove a material
   * @param {string} materialId 
   */
  async removeMaterial(materialId) {
    const { error } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw new Error(error.message);
  }
}

module.exports = new CourseRepository();
