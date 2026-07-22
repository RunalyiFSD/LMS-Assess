const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * SubjectRepository
 *
 * DEFERRED: Sprint 3/4
 * Subjects in the new Supabase schema are represented as course categories
 * or department-level groupings. The legacy MongoDB schema had a separate
 * Subject collection — this has been replaced by the `departments` table and
 * course-level categorization in the new schema.
 *
 * This repository provides a basic interface wrapping departments as subject-
 * equivalents until a dedicated subjects table is introduced in Sprint 3.
 */
class SubjectRepository {
  /**
   * Find all subjects (mapped to departments for now).
   * @returns {Promise<Array>}
   */
  async findAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code')
      .order('name');

    if (error) throw new AppError(`Error fetching subjects: ${error.message}`, 500);
    return data || [];
  }

  /**
   * Find subject by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new AppError(`Error fetching subject: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Create a new subject (department).
   * @param {Object} subjectData 
   * @returns {Promise<Object>}
   */
  async create(subjectData) {
    const { data, error } = await supabase
      .from('departments')
      .insert([subjectData])
      .select('id, name, code')
      .single();

    if (error) throw new AppError(`Error creating subject: ${error.message}`, 500);
    return data;
  }

  /**
   * Delete a subject (department).
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(`Error deleting subject: ${error.message}`, 500);
  }
}

module.exports = new SubjectRepository();
