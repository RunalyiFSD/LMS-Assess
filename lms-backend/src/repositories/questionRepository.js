const { supabase } = require('../config/supabase');

class QuestionRepository {
  /**
   * Get all questions for an assessment, optionally including options
   */
  async findByAssessmentId(assessmentId, includeOptions = true) {
    let query = supabase
      .from('questions')
      .select(includeOptions ? '*, question_options(*)' : '*')
      .eq('assessment_id', assessmentId)
      .order('order', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create a new question
   */
  async create(questionData) {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Create question options (for MCQs)
   */
  async createOptions(optionsDataArray) {
    if (!optionsDataArray || optionsDataArray.length === 0) return [];
    
    const { data, error } = await supabase
      .from('question_options')
      .insert(optionsDataArray)
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update a question
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Delete a question (will cascade delete options)
   */
  async delete(id) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

module.exports = new QuestionRepository();
