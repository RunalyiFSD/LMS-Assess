const { supabase } = require('../config/supabase');

class DepartmentRepository {
  /**
   * Find all departments
   * @returns {Promise<Array>} Array of departments
   */
  async findAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Find department by ID
   * @param {string} id 
   * @returns {Promise<Object>} Department object
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create a new department
   * @param {Object} departmentData 
   * @returns {Promise<Object>} Created department
   */
  async create(departmentData) {
    const { data, error } = await supabase
      .from('departments')
      .insert([departmentData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update department
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>} Updated department
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Delete department
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
}

module.exports = new DepartmentRepository();
