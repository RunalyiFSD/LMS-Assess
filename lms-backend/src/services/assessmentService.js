const assessmentRepository = require('../repositories/assessmentRepository');
const questionRepository = require('../repositories/questionRepository');
const courseRepository = require('../repositories/courseRepository');

class AssessmentService {
  async getAllAssessments(filters, userId, role) {
    // If student, we normally let controller / DB RLS handle access.
    // We can just fetch based on filters.
    return await assessmentRepository.findAll(filters);
  }

  async getAssessmentById(id) {
    return await assessmentRepository.findById(id);
  }

  async createAssessment(data, teacherId, role) {
    // Ensure course exists and teacher owns it (if not admin)
    const course = await courseRepository.findById(data.course_id);
    if (!course) throw new Error('Course not found');
    
    if (role !== 'admin' && course.teacher_id !== teacherId) {
      throw new Error('Unauthorized to create assessments for this course');
    }

    return await assessmentRepository.create({ ...data, teacher_id: teacherId });
  }

  async updateAssessment(id, data, teacherId, role) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) throw new Error('Assessment not found');

    if (role !== 'admin' && assessment.teacher_id !== teacherId) {
      throw new Error('Unauthorized to modify this assessment');
    }

    return await assessmentRepository.update(id, data);
  }

  async deleteAssessment(id, teacherId, role) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) throw new Error('Assessment not found');

    if (role !== 'admin' && assessment.teacher_id !== teacherId) {
      throw new Error('Unauthorized to delete this assessment');
    }

    await assessmentRepository.delete(id);
  }

  // ---- Questions ----
  
  async getQuestions(assessmentId) {
    return await questionRepository.findByAssessmentId(assessmentId);
  }

  async addQuestion(assessmentId, questionData, optionsData, teacherId, role) {
    const assessment = await assessmentRepository.findById(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    if (role !== 'admin' && assessment.teacher_id !== teacherId) {
      throw new Error('Unauthorized to add questions to this assessment');
    }

    const question = await questionRepository.create({
      ...questionData,
      assessment_id: assessmentId
    });

    let options = [];
    if (question.type === 'mcq' && optionsData && optionsData.length > 0) {
      const optionsToInsert = optionsData.map(opt => ({
        ...opt,
        question_id: question.id
      }));
      options = await questionRepository.createOptions(optionsToInsert);
    }

    return { ...question, question_options: options };
  }

  async updateQuestion(questionId, assessmentId, updateData, teacherId, role) {
    const assessment = await assessmentRepository.findById(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    if (role !== 'admin' && assessment.teacher_id !== teacherId) {
      throw new Error('Unauthorized to modify questions');
    }

    return await questionRepository.update(questionId, updateData);
  }

  async deleteQuestion(questionId, assessmentId, teacherId, role) {
    const assessment = await assessmentRepository.findById(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    if (role !== 'admin' && assessment.teacher_id !== teacherId) {
      throw new Error('Unauthorized to delete questions');
    }

    await questionRepository.delete(questionId);
  }
}

module.exports = new AssessmentService();
