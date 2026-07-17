const submissionRepository = require('../repositories/submissionRepository');
const questionRepository = require('../repositories/questionRepository');
const assessmentRepository = require('../repositories/assessmentRepository');

class EvaluationService {
  /**
   * Starts a submission (attempt) for a student
   */
  async startSubmission(assessmentId, studentId) {
    // Check if already active/submitted
    const existing = await submissionRepository.findByStudentAndAssessment(studentId, assessmentId);
    if (existing) {
      if (existing.status === 'in_progress') return existing;
      throw new Error('You have already submitted this assessment.');
    }

    return await submissionRepository.create({
      assessment_id: assessmentId,
      student_id: studentId,
      status: 'in_progress'
    });
  }

  /**
   * Saves intermediate answers without finalizing
   */
  async saveAnswers(submissionId, studentId, answersArray) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw new Error('Submission not found');
    if (submission.student_id !== studentId) throw new Error('Unauthorized');
    if (submission.status !== 'in_progress') throw new Error('Cannot modify a finalized submission');

    const upsertData = answersArray.map(ans => ({
      submission_id: submissionId,
      question_id: ans.question_id,
      answer_text: ans.answer_text || null,
      code_answer: ans.code_answer || null,
      selected_option_id: ans.selected_option_id || null
    }));

    return await submissionRepository.upsertAnswers(upsertData);
  }

  /**
   * Submits the assessment and triggers auto-grading for MCQs
   */
  async submitAssessment(submissionId, studentId, finalAnswers) {
    // 1. Save final answers
    if (finalAnswers && finalAnswers.length > 0) {
      await this.saveAnswers(submissionId, studentId, finalAnswers);
    }

    const submission = await submissionRepository.findById(submissionId);
    const assessment = await assessmentRepository.findById(submission.assessment_id);
    
    // 2. Fetch all questions and options for this assessment
    const questions = await questionRepository.findByAssessmentId(assessment.id, true);
    
    // 3. Auto-grade MCQs
    let totalScore = 0;
    let autoGradedComplete = true; // Will turn false if there are theory/coding questions pending
    
    // Use the latest fetched answers from the DB since we just saved them
    const latestAnswers = (await submissionRepository.findById(submissionId)).submission_answers;
    
    const evaluatedAnswers = latestAnswers.map(ans => {
      const question = questions.find(q => q.id === ans.question_id);
      
      let marksAwarded = 0;
      let feedback = null;

      if (question && question.type === 'mcq') {
        const selectedOpt = question.question_options.find(opt => opt.id === ans.selected_option_id);
        if (selectedOpt && selectedOpt.is_correct) {
          marksAwarded = question.marks;
        } else {
          marksAwarded = 0;
        }
      } else if (question) {
        // Theory or Coding require manual grading (or AI grading in Sprint 7)
        autoGradedComplete = false;
        marksAwarded = 0; 
      }

      totalScore += marksAwarded;

      return {
        ...ans,
        marks_awarded: marksAwarded,
        feedback
      };
    });

    // Save marks for auto-graded answers
    if (evaluatedAnswers.length > 0) {
      await submissionRepository.upsertAnswers(evaluatedAnswers);
    }

    // 4. Update Submission Status
    const newStatus = autoGradedComplete ? 'evaluated' : 'submitted';
    
    return await submissionRepository.update(submissionId, {
      status: newStatus,
      score: totalScore,
      submitted_at: new Date().toISOString(),
      evaluated_at: autoGradedComplete ? new Date().toISOString() : null
    });
  }

  /**
   * Manual grading (Teacher)
   */
  async gradeSubmission(submissionId, teacherId, role, updates) {
    const submission = await submissionRepository.findById(submissionId);
    const assessment = await assessmentRepository.findById(submission.assessment_id);
    
    if (role !== 'admin' && assessment.teacher_id !== teacherId) {
      throw new Error('Unauthorized to grade this submission');
    }

    // Process updates = [{ question_id, marks_awarded, feedback }]
    const answersToUpdate = updates.map(u => {
      // Must preserve existing values that shouldn't change
      const existingAnswer = submission.submission_answers.find(ans => ans.question_id === u.question_id);
      return {
        submission_id: submissionId,
        question_id: u.question_id,
        answer_text: existingAnswer?.answer_text || null,
        code_answer: existingAnswer?.code_answer || null,
        selected_option_id: existingAnswer?.selected_option_id || null,
        marks_awarded: u.marks_awarded,
        feedback: u.feedback
      };
    });

    if (answersToUpdate.length > 0) {
      await submissionRepository.upsertAnswers(answersToUpdate);
    }

    // Recalculate total score
    const updatedSub = await submissionRepository.findById(submissionId);
    const totalScore = updatedSub.submission_answers.reduce((acc, ans) => acc + (ans.marks_awarded || 0), 0);

    return await submissionRepository.update(submissionId, {
      status: 'evaluated',
      score: totalScore,
      evaluated_at: new Date().toISOString()
    });
  }
}

module.exports = new EvaluationService();
