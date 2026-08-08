const leetcodeService = require('../services/leetcodeService');
const CodingQuestion = require('../models/CodingQuestion');
const MCQQuestion = require('../models/MCQQuestion');
const Assessment = require('../models/Assessment');
const Subject = require('../models/Subject');
const AppError = require('../utils/AppError');

// @desc    Get supported company presets with metadata
// @route   GET /api/leetcode/companies
// @access  Public / Authenticated
exports.getCompanies = async (req, res, next) => {
  try {
    const presets = leetcodeService.getCompanyPresets();
    res.status(200).json({
      status: 'success',
      data: {
        companies: presets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Preview company questions directly from LeetCode GraphQL
// @route   GET /api/leetcode/preview/:companySlug
// @access  Public / Authenticated
exports.previewCompanyQuestions = async (req, res, next) => {
  try {
    const { companySlug } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;

    const questions = await leetcodeService.fetchCompanyProblemsFromLeetCode(companySlug, limit);

    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: {
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import selected LeetCode questions into Question Bank
// @route   POST /api/leetcode/import
// @access  Instructor, Admin
exports.importCompanyQuestions = async (req, res, next) => {
  try {
    const { companySlug, titleSlugs, subjectId } = req.body;

    if (!titleSlugs || !Array.isArray(titleSlugs) || titleSlugs.length === 0) {
      return next(new AppError('Please provide an array of LeetCode question titleSlugs to import.', 400));
    }

    // Find or fallback subject
    let subject = await Subject.findById(subjectId);
    if (!subject) {
      subject = await Subject.findOne();
    }
    if (!subject) {
      // Create a default general subject if none exists
      subject = await Subject.create({
        name: 'Company Aptitude & Coding',
        code: 'COMP-101',
        description: 'Company-specific coding and aptitude questions',
      });
    }

    const importedQuestions = [];

    for (const slug of titleSlugs) {
      // Check if already imported
      let existing = await CodingQuestion.findOne({ leetcodeSlug: slug });
      if (existing) {
        if (companySlug && !existing.companyTags.includes(companySlug)) {
          existing.companyTags.push(companySlug);
          await existing.save();
        }
        importedQuestions.push(existing);
        continue;
      }

      // Fetch detail from LeetCode
      const detail = await leetcodeService.fetchQuestionDetailFromLeetCode(slug);

      const newQuestion = await CodingQuestion.create({
        title: detail.title,
        description: detail.description,
        constraints: detail.constraints || 'Standard memory and execution limits apply.',
        sampleInput: detail.sampleInput,
        sampleOutput: detail.sampleOutput,
        testCases: detail.testCases,
        templates: detail.templates,
        marks: detail.marks || 10,
        difficulty: detail.difficulty || 'moderate',
        subject: subject._id,
        createdBy: req.user._id,
        companyTags: [companySlug || 'general'],
        leetcodeSlug: slug,
        source: 'leetcode',
      });

      importedQuestions.push(newQuestion);
    }

    res.status(201).json({
      status: 'success',
      importedCount: importedQuestions.length,
      data: {
        questions: importedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a complete Company Mock Assessment (Coding + Aptitude)
// @route   POST /api/leetcode/create-mock
// @access  Authenticated (Students, Instructors, Admins)
exports.createCompanyMockAssessment = async (req, res, next) => {
  try {
    const {
      companySlug,
      titleSlugs,
      title: customTitle,
      duration: customDuration,
      passingScore: customPassingScore,
      dueDate: customDueDate,
      assignmentType: customAssignmentType,
      assignedBatch: customAssignedBatch,
      assignedStudents: customAssignedStudents,
    } = req.body;
    const targetCompany = companySlug || 'google';

    const companyPresets = leetcodeService.getCompanyPresets();
    const companyInfo = companyPresets[targetCompany] || companyPresets.google;

    // Get or create Subject
    let subject = await Subject.findOne({ name: { $regex: new RegExp(companyInfo.name, 'i') } });
    if (!subject) {
      subject = await Subject.findOne();
    }
    if (!subject) {
      subject = await Subject.create({
        name: 'Company Placement Prep',
        code: 'PLAC-101',
        description: 'Real Company placement exams',
      });
    }

    // 1. Fetch & Store Coding Questions
    const targetSlugs = titleSlugs && titleSlugs.length > 0
      ? titleSlugs
      : ['two-sum', 'longest-substring-without-repeating-characters'];

    const questions = []; // { questionId, questionModel } array

    for (const slug of targetSlugs) {
      let q = await CodingQuestion.findOne({ leetcodeSlug: slug });
      if (!q) {
        const detail = await leetcodeService.fetchQuestionDetailFromLeetCode(slug);
        q = await CodingQuestion.create({
          title: detail.title,
          description: detail.description,
          constraints: detail.constraints || 'Standard memory & CPU limit',
          sampleInput: detail.sampleInput,
          sampleOutput: detail.sampleOutput,
          testCases: detail.testCases,
          templates: detail.templates,
          marks: detail.marks || 10,
          difficulty: detail.difficulty || 'moderate',
          subject: subject._id,
          createdBy: req.user._id,
          companyTags: [targetCompany],
          leetcodeSlug: slug,
          source: 'leetcode',
        });
      }
      questions.push({ questionId: q._id, questionModel: 'CodingQuestion' });
    }

    // 2. Fetch & Store Aptitude MCQs
    const aptitudeSeeds = leetcodeService.getCompanyAptitudeBank(targetCompany);

    for (const mcqSeed of aptitudeSeeds) {
      let mcq = await MCQQuestion.findOne({ question: mcqSeed.question });
      if (!mcq) {
        mcq = await MCQQuestion.create({
          question: mcqSeed.question,
          options: mcqSeed.options,
          correctAnswerIndex: mcqSeed.correctAnswerIndex,
          marks: mcqSeed.marks,
          difficulty: mcqSeed.difficulty,
          subject: subject._id,
          topic: mcqSeed.topic,
          createdBy: req.user._id,
          companyTags: [targetCompany],
          source: 'company_bank',
        });
      }
      questions.push({ questionId: mcq._id, questionModel: 'MCQQuestion' });
    }

    // 3. Calculate Total Marks & Duration & Defaults
    const codingMarks = targetSlugs.length * 10;
    const mcqMarks = aptitudeSeeds.length * 2;
    const totalMarks = codingMarks + mcqMarks;
    const passingScore = customPassingScore ? Number(customPassingScore) : Math.round(totalMarks * 0.4);
    const title = customTitle || `${companyInfo.name} Placement & Aptitude Mock Assessment`;
    const duration = customDuration ? Number(customDuration) : 60;

    const now = new Date();
    const dueDate = customDueDate ? new Date(customDueDate) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const assessment = await Assessment.create({
      title,
      description: `Official Placement Simulation for ${companyInfo.name}. Test your Aptitude, Analytical skills, and LeetCode Coding abilities under timed conditions. Assigned by ${req.user.name || 'Instructor'}.`,
      type: 'coding',
      subject: subject._id,
      questions,
      totalMarks,
      passingScore,
      duration,
      dueDate,
      isActive: true,
      isMock: true,
      assignmentType: customAssignmentType || 'all',
      assignedBatch: customAssignedBatch || null,
      assignedStudents: customAssignedStudents || [],
      creator: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      message: `${companyInfo.name} Mock Assessment assigned successfully!`,
      data: {
        assessment,
      },
    });
  } catch (error) {
    console.error('[create-mock] Error:', error.message);
    next(error);
  }
};
