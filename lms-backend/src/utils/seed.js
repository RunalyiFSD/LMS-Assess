const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Subject = require('../models/Subject');
const Assessment = require('../models/Assessment');
const MCQQuestion = require('../models/MCQQuestion');
const CodingQuestion = require('../models/CodingQuestion');
const TheoryQuestion = require('../models/TheoryQuestion');
const Attempt = require('../models/Attempt');
const Result = require('../models/Result');
const Leaderboard = require('../models/Leaderboard');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment');
    console.log('Connected. Cleaning up old database records...');

    // Clean all collections
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Assessment.deleteMany({});
    await MCQQuestion.deleteMany({});
    await CodingQuestion.deleteMany({});
    await TheoryQuestion.deleteMany({});
    await Attempt.deleteMany({});
    await Result.deleteMany({});
    await Leaderboard.deleteMany({});
    await Notification.deleteMany({});

    console.log('Database cleaned. Seeding default users...');

    // 1. Create Default Users (Admin, Instructor, Student)
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'admin',
      college: 'Harvard University',
      department: 'Office of Registrar',
    });

    const instructor = await User.create({
      name: 'Dr. Clara Mendelson',
      email: 'instructor@college.edu',
      password: 'password123',
      role: 'instructor',
      college: 'Harvard University',
      department: 'Computer Science',
    });

    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'student1@college.edu',
      password: 'password123',
      role: 'student',
      college: 'Harvard University',
      department: 'Computer Science',
      batch: '2026',
      bio: 'Enthusiastic developer learning algorithms and MERN stack systems.',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const student2 = await User.create({
      name: 'David Smith',
      email: 'student2@college.edu',
      password: 'password123',
      role: 'student',
      college: 'Harvard University',
      department: 'Computer Science',
      batch: '2026',
      bio: 'Enjoys logic puzzles, competitive programming, and automated compilers.',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    console.log('Seeding default subjects...');

    // 2. Create Subjects
    const subjectCS = await Subject.create({
      name: 'Data Structures & Algorithms',
      code: 'CS-102',
      description: 'Binary trees, execution runtime constraints, sorting, search algorithms.',
      createdBy: instructor._id,
    });

    const subjectDB = await Subject.create({
      name: 'Database Management Systems',
      code: 'CS-103',
      description: 'SQL queries, relational calculus, MongoDB schemas and aggregation properties.',
      createdBy: instructor._id,
    });

    console.log('Seeding question bank...');

    // 3. Create Questions
    // MCQ Question
    const mcq1 = await MCQQuestion.create({
      question: 'Which data structure follows the Last-In-First-Out (LIFO) model?',
      options: ['Queue', 'Linked List', 'Stack', 'Heap Array'],
      correctAnswerIndex: 2,
      marks: 5,
      negativeMarks: 1.25,
      difficulty: 'moderate',
      subject: subjectCS._id,
      topic: 'Stacks',
      createdBy: instructor._id,
    });

    // Coding Question
    const coding1 = await CodingQuestion.create({
      title: 'Sum of Two Numbers',
      description: 'Write a program that takes two line inputs containing integers and returns their arithmetic sum on the standard output.',
      constraints: '-10^5 <= val <= 10^5',
      sampleInput: '5\n10',
      sampleOutput: '15',
      testCases: [
        { input: '5\n10', expectedOutput: '15', isSample: true },
        { input: '-10\n22', expectedOutput: '12', isSample: false }
      ],
      templates: [
        {
          language: 'javascript',
          starterCode: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst a = parseInt(input[0]);\nconst b = parseInt(input[1]);\n// Write your output logic below\nconsole.log(a + b);`
        }
      ],
      marks: 20,
      difficulty: 'easy',
      subject: subjectCS._id,
      createdBy: instructor._id,
    });

    // Theory Question
    const theory1 = await TheoryQuestion.create({
      question: 'Explain the difference between SQL database models and Relational Schema designs compared to NoSQL MongoDB structures.',
      maxMarks: 10,
      suggestedAnswer: 'SQL represents tabular schemas with rigid tables and foreign keys. NoSQL MongoDB represents JSON documents with flexible hierarchies, embedding, and fast collection lookups.',
      subject: subjectDB._id,
      createdBy: instructor._id,
    });

    console.log('Scheduling assessments...');

    // 4. Create Assessments
    // MCQ Assessment
    const testMCQ = await Assessment.create({
      title: 'DSA Midterm Quiz',
      description: 'Covers LIFO stacks, graphs, tree traversals, and basic time complexities.',
      subject: subjectCS._id,
      type: 'mcq',
      duration: 15,
      passingScore: 5,
      totalMarks: 5,
      questions: [{ questionId: mcq1._id, questionModel: 'MCQQuestion' }],
      creator: instructor._id,
      isActive: true,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    });

    // Coding Assessment
    const testCoding = await Assessment.create({
      title: 'Algorithm Coding Sandbox Test',
      description: 'Implement arithmetic addition scripts under execution and memory constraints.',
      subject: subjectCS._id,
      type: 'coding',
      duration: 30,
      passingScore: 10,
      totalMarks: 20,
      questions: [{ questionId: coding1._id, questionModel: 'CodingQuestion' }],
      creator: instructor._id,
      isActive: true,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    // Theory Assessment
    const testTheory = await Assessment.create({
      title: 'Database Systems Essay Test',
      description: 'Write analytical details on SQL relational mapping versus NoSQL documents.',
      subject: subjectDB._id,
      type: 'theory',
      duration: 40,
      passingScore: 5,
      totalMarks: 10,
      questions: [{ questionId: theory1._id, questionModel: 'TheoryQuestion' }],
      creator: instructor._id,
      isActive: true,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    console.log('Seeding demo results...');

    // 5. Seed some initial attempts & results for Alice (Student 1) to populate rankings
    const attemptAlice = await Attempt.create({
      student: student1._id,
      assessment: testMCQ._id,
      status: 'graded',
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      submittedAt: new Date(Date.now() - 25 * 60 * 1000),
      timeTakenSeconds: 300,
      answers: [{ questionId: mcq1._id, selectedOptionIndex: 2, marksObtained: 5, isCorrect: true }],
      totalMarksObtained: 5,
      isPassed: true,
    });

    await Result.create({
      student: student1._id,
      assessment: testMCQ._id,
      attempt: attemptAlice._id,
      totalMarks: 5,
      scoreObtained: 5,
      percentage: 100,
      status: 'pass',
    });

    // Recalculate DSA leaderboard
    const rankings = [
      { student: student1._id, score: 5, timeTakenSeconds: 300, submittedAt: attemptAlice.submittedAt, rank: 1 }
    ];
    await Leaderboard.create({
      assessment: testMCQ._id,
      rankings,
    });

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedData();
