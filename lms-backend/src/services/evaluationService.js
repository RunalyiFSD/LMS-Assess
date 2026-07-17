const MCQQuestion = require('../legacy/models/MCQQuestion');
const CodingQuestion = require('../legacy/models/CodingQuestion');
const TheoryQuestion = require('../legacy/models/TheoryQuestion');
const codeExecutionService = require('./codeExecutionService');

/**
 * Automates evaluation of a student's answer sheet.
 * @param {Array} questions - The assessment's questions list [{questionId, questionModel}]
 * @param {Array} studentAnswers - Student's submissions [{questionId, selectedOptionIndex, submittedCode, language, submittedText}]
 * @returns {Promise<Object>} { gradedAnswers: Array, totalMarksObtained: Number }
 */
exports.evaluateAttemptAnswers = async (questions, studentAnswers) => {
  let totalMarksObtained = 0;
  const gradedAnswers = [];

  // Map student answers by questionId for fast retrieval
  const answerMap = new Map();
  studentAnswers.forEach((ans) => {
    answerMap.set(ans.questionId.toString(), ans);
  });

  for (const qRef of questions) {
    const qIdStr = qRef.questionId.toString();
    const studentAns = answerMap.get(qIdStr);
    
    // Default structure for question answer
    const gradedAns = {
      questionId: qRef.questionId,
      marksObtained: 0,
    };

    if (qRef.questionModel === 'MCQQuestion') {
      const qData = await MCQQuestion.findById(qRef.questionId);
      if (qData) {
        gradedAns.selectedOptionIndex = studentAns ? studentAns.selectedOptionIndex : null;
        
        if (studentAns && studentAns.selectedOptionIndex !== null && studentAns.selectedOptionIndex !== undefined) {
          const isCorrect = studentAns.selectedOptionIndex === qData.correctAnswerIndex;
          if (isCorrect) {
            gradedAns.marksObtained = qData.marks;
            totalMarksObtained += qData.marks;
          } else {
            // Apply negative marks only for Moderate/Difficult questions
            if (qData.difficulty === 'moderate' || qData.difficulty === 'difficult') {
              const penalty = qData.negativeMarks || 0;
              gradedAns.marksObtained = -penalty;
              totalMarksObtained -= penalty;
            } else {
              gradedAns.marksObtained = 0;
            }
          }
          gradedAns.isCorrect = isCorrect;
        } else {
          // Unanswered MCQ
          gradedAns.marksObtained = 0;
          gradedAns.isCorrect = false;
        }
      }
    } 
    
    else if (qRef.questionModel === 'CodingQuestion') {
      const qData = await CodingQuestion.findById(qRef.questionId);
      if (qData && studentAns) {
        gradedAns.submittedCode = studentAns.submittedCode || '';
        gradedAns.language = studentAns.language || '';
        
        // Execute code
        const execResult = await codeExecutionService.executeCode(
          gradedAns.submittedCode,
          gradedAns.language,
          qData.testCases,
          qData.timeLimit
        );
        
        // Calculate partial scores
        const ratio = execResult.totalTestCases > 0 ? execResult.testCasesPassed / execResult.totalTestCases : 0;
        const marks = Math.round(ratio * qData.marks * 100) / 100;
        
        gradedAns.marksObtained = marks;
        gradedAns.testCasesPassedCount = execResult.testCasesPassed;
        gradedAns.executionLogs = execResult.executionLogs;
        
        totalMarksObtained += marks;
      }
    } 
    
    else if (qRef.questionModel === 'TheoryQuestion') {
      const qData = await TheoryQuestion.findById(qRef.questionId);
      if (qData && studentAns) {
        gradedAns.submittedText = studentAns.submittedText || '';
        
        // Calculate suggested heuristic score based on response length and simple semantic checks
        const text = gradedAns.submittedText.trim();
        const wordCount = text === '' ? 0 : text.split(/\s+/).length;
        
        let suggestedScore = 0;
        if (wordCount > 5) {
          // Basic heuristic: length indicates effort, max marks limit
          const lengthScore = Math.min((wordCount / 100) * qData.maxMarks, qData.maxMarks * 0.6); // cap length auto-suggest at 60%
          suggestedScore = Math.round(lengthScore * 10) / 10;
        }
        
        gradedAns.suggestedScore = suggestedScore;
        gradedAns.marksObtained = 0; // Not final until manual review overrides
        gradedAns.feedback = 'Pending instructor manual grading.';
        gradedAns.isGraded = false;
      }
    }

    gradedAnswers.push(gradedAns);
  }

  // Prevent total marks from dipping below 0 due to negative marking
  totalMarksObtained = Math.max(0, totalMarksObtained);

  return { gradedAnswers, totalMarksObtained };
};
