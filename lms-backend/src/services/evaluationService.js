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
        
        // 1. Execute code deterministically against configured test cases inside hardened sandbox
        const execResult = await codeExecutionService.executeCode(
          gradedAns.submittedCode,
          gradedAns.language,
          qData.testCases,
          qData.timeLimit
        );

        if (execResult.securityViolation) {
          // Security violation / sandbox failure: Do NOT guess marks or delete submission.
          // Persist submission, log reason, and route for instructor review.
          gradedAns.marksObtained = 0;
          gradedAns.testCasesPassedCount = 0;
          gradedAns.executionLogs = execResult.executionLogs;
          gradedAns.isGraded = false;
          gradedAns.pendingReview = true;
          const reviewNotice = `[Flagged for Review] ${execResult.violationReason || 'Sandbox execution anomaly'}. Submitted code preserved for instructor manual evaluation.`;
          gradedAns.feedback = reviewNotice;
          gradedAns.aiFeedback = reviewNotice;
          gradedAns.aiGraded = false;
          hasPendingReviews = true;
        } else {
          // 2. Compute marks strictly from deterministic test case ratio
          const ratio = execResult.totalTestCases > 0 ? execResult.testCasesPassed / execResult.totalTestCases : 0;
          const marks = Math.round(ratio * qData.marks * 100) / 100;
          
          gradedAns.marksObtained = marks;
          gradedAns.testCasesPassedCount = execResult.testCasesPassed;
          gradedAns.executionLogs = execResult.executionLogs;
          gradedAns.isGraded = true;
          gradedAns.pendingReview = false;
          
          totalMarksObtained += marks;

          // 3. Generate AI qualitative feedback (complexity, optimization, edge cases, style) without altering marks
          if (gradedAns.submittedCode.trim().length > 0) {
          try {
            const problemStatement = `${qData.title}\n\n${qData.description}\n\nConstraints: ${qData.constraints || 'Standard'}`;
            const executionSummary = `Passed ${execResult.testCasesPassed}/${execResult.totalTestCases} test cases.\n${execResult.executionLogs}`;
            
            const aiResult = await aiEvaluationService.evaluateCoding(
              problemStatement,
              gradedAns.submittedCode,
              executionSummary
            );

            let formattedFeedback = '';
            if (aiResult.complexity && (aiResult.complexity.time || aiResult.complexity.space)) {
              formattedFeedback += `⏱ Complexity: ${aiResult.complexity.time || 'N/A'} time, ${aiResult.complexity.space || 'N/A'} space\n`;
            }
            if (aiResult.feedback) {
              formattedFeedback += `\n${aiResult.feedback}\n`;
            }
            if (Array.isArray(aiResult.optimizationSuggestions) && aiResult.optimizationSuggestions.length > 0) {
              formattedFeedback += `\n🚀 Optimization Suggestions:\n${aiResult.optimizationSuggestions.map(s => `• ${s}`).join('\n')}\n`;
            }
            if (Array.isArray(aiResult.edgeCases) && aiResult.edgeCases.length > 0) {
              formattedFeedback += `\n⚠️ Edge Cases:\n${aiResult.edgeCases.map(e => `• ${e}`).join('\n')}\n`;
            }
            if (aiResult.styleFeedback) {
              formattedFeedback += `\n✨ Style & Best Practices: ${aiResult.styleFeedback}`;
            }

            const cleanFeedback = formattedFeedback.trim() || 'Code analysis completed.';
            gradedAns.aiFeedback = cleanFeedback;
            gradedAns.feedback = cleanFeedback;
            gradedAns.aiGraded = true;
            gradedAns.aiResult = aiResult;
          } catch (aiErr) {
            console.error(`[EvaluationService] AI Coding feedback fallback for question ${qData._id}:`, aiErr.message);
            const fallbackFeedback = `Code execution completed: Passed ${execResult.testCasesPassed}/${execResult.totalTestCases} test cases. (AI qualitative review unavailable).`;
            gradedAns.aiFeedback = fallbackFeedback;
            gradedAns.feedback = fallbackFeedback;
            gradedAns.aiGraded = false;
          }
        } else {
          gradedAns.aiFeedback = 'No code submitted.';
          gradedAns.feedback = 'No code submitted.';
          gradedAns.aiGraded = true;
        }
        }
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
              : 'Evaluate the essay response based on accuracy, completeness, terminology, and conceptual correctness.');

            const aiResult = await aiEvaluationService.evaluateTheory(
              qData.question,
              rubric,
              text
            );

            // Scale score (0-100) to question's maxMarks
            const scaledMarks = Math.round(((aiResult.score || 0) / 100) * qData.maxMarks * 100) / 100;
            
            // Format feedback string cleanly
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

            // Evaluation confidence & rubric dimensions
            const confidence = typeof aiResult.confidence === 'number' ? aiResult.confidence : 1.0;
            const requiresHumanReview = confidence < 0.60;

            gradedAns.marksObtained = scaledMarks;
            gradedAns.aiMarks = scaledMarks;
            gradedAns.aiFeedback = formattedFeedback;
            gradedAns.feedback = formattedFeedback;
            gradedAns.accuracy = typeof aiResult.accuracy === 'number' ? aiResult.accuracy : 8;
            gradedAns.completeness = typeof aiResult.completeness === 'number' ? aiResult.completeness : 8;
            gradedAns.terminology = typeof aiResult.terminology === 'number' ? aiResult.terminology : 8;
            gradedAns.confidenceScore = confidence;
            gradedAns.aiGraded = true;
            gradedAns.isGraded = true;
            gradedAns.pendingReview = requiresHumanReview;
            gradedAns.aiResult = aiResult;

            totalMarksObtained += scaledMarks;
          } catch (aiErr) {
            console.error(`[EvaluationService] AI Theory evaluation error for question ${qData._id}:`, aiErr.message);
            
            // Strictly NO heuristic guessing. Set 0 marks and flag for instructor manual evaluation.
            gradedAns.marksObtained = 0;
            gradedAns.aiMarks = null;
            gradedAns.aiFeedback = 'AI evaluation service temporarily unavailable.';
            gradedAns.feedback = 'Pending instructor manual evaluation.';
            gradedAns.aiGraded = false;
            gradedAns.isGraded = false;
            gradedAns.pendingReview = true;
            gradedAns.confidenceScore = 0;
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
          gradedAns.confidenceScore = 1.0;
        }
      }
    }

    gradedAnswers.push(gradedAns);
  }

  // Prevent total marks from dipping below 0 due to negative marking
  totalMarksObtained = Math.max(0, totalMarksObtained);

  return { gradedAnswers, totalMarksObtained };
};
