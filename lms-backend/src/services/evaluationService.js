const MCQQuestion = require('../models/MCQQuestion');
const CodingQuestion = require('../models/CodingQuestion');
const TheoryQuestion = require('../models/TheoryQuestion');
const codeExecutionService = require('./codeExecutionService');
const aiEvaluationService = require('../ai/services/evaluationService');

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
      if (qData) {
        gradedAns.submittedText = studentAns ? (studentAns.submittedText || '') : '';
        const text = gradedAns.submittedText.trim();

        if (text.length > 0) {
          try {
            // Construct dynamic rubric from question model fields
            const rubric = qData.rubric || (qData.keywords && qData.keywords.length > 0
              ? `Key concepts to cover: ${qData.keywords.join(', ')}. Sample Answer: ${qData.sampleAnswer || 'N/A'}`
              : 'Evaluate the essay response based on accuracy, depth, clarity, and conceptual correctness.');

            const aiResult = await aiEvaluationService.evaluateTheory(
              qData.question,
              rubric,
              text
            );

            // Scale score (0-100) to question's maxMarks
            const scaledMarks = Math.round(((aiResult.score || 0) / 100) * qData.maxMarks * 100) / 100;
            
            // Format feedback string cleanly (handles string, array of objects, or object)
            let formattedFeedback = 'AI evaluated response.';
            if (typeof aiResult.feedback === 'string') {
              formattedFeedback = aiResult.feedback;
            } else if (Array.isArray(aiResult.feedback)) {
              formattedFeedback = aiResult.feedback
                .map(f => (typeof f === 'string' ? f : `• [${(f.type || 'note').toUpperCase()}] ${f.message || JSON.stringify(f)}`))
                .join('\n');
            } else if (aiResult.feedback) {
              formattedFeedback = JSON.stringify(aiResult.feedback);
            }

            gradedAns.marksObtained = scaledMarks;
            gradedAns.aiMarks = scaledMarks;
            gradedAns.aiFeedback = formattedFeedback;
            gradedAns.feedback = formattedFeedback;
            gradedAns.aiGraded = true;
            gradedAns.isGraded = true;
            gradedAns.pendingReview = ((aiResult.score || 0) < 40); // Flag borderline answers
            gradedAns.aiResult = aiResult;

            totalMarksObtained += scaledMarks;
          } catch (aiErr) {
            console.error(`[EvaluationService] AI Theory evaluation fallback for question ${qData._id}:`, aiErr.message);
            // Graceful fallback to word-count heuristic if AI is temporarily unreachable
            const wordCount = text.split(/\s+/).length;
            const fallbackMarks = wordCount > 5 
              ? Math.min(Math.round((wordCount / 100) * qData.maxMarks * 10) / 10, qData.maxMarks * 0.5) 
              : 0;
            
            gradedAns.marksObtained = fallbackMarks;
            gradedAns.aiMarks = fallbackMarks;
            gradedAns.aiFeedback = 'AI service temporarily unavailable. Preliminary heuristic score applied.';
            gradedAns.feedback = 'Pending instructor manual verification.';
            gradedAns.aiGraded = false;
            gradedAns.isGraded = false;
            gradedAns.pendingReview = true;
            
            totalMarksObtained += fallbackMarks;
          }
        } else {
          // Empty answer submitted
          gradedAns.marksObtained = 0;
          gradedAns.aiMarks = 0;
          gradedAns.aiFeedback = 'No response provided.';
          gradedAns.feedback = 'No response provided.';
          gradedAns.aiGraded = true;
          gradedAns.isGraded = true;
          gradedAns.pendingReview = false;
        }
      }
    }

    gradedAnswers.push(gradedAns);
  }

  // Prevent total marks from dipping below 0 due to negative marking
  totalMarksObtained = Math.max(0, totalMarksObtained);

  return { gradedAnswers, totalMarksObtained };
};
