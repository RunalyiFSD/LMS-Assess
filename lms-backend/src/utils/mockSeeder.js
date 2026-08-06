const Subject = require('../models/Subject');
const Assessment = require('../models/Assessment');
const MCQQuestion = require('../models/MCQQuestion');
const CodingQuestion = require('../models/CodingQuestion');
const User = require('../models/User');

const mockTemplates = [
  { title: 'SDE', time: '50 Minutes', objective: 5, programming: 2, type: 'coding', registrations: '69092 Registrations' },
  { title: 'React', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '2284 Registrations' },
  { title: 'Java', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '6682 Registrations' },
  { title: 'SQL', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '16070 Registrations' },
  { title: 'AngularJS', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: null },
  { title: 'Javascript', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '4629 Registrations' },
  { title: 'C++', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '2429 Registrations' },
  { title: 'HTML', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '4378 Registrations' },
  { title: 'OOPs', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '3373 Registrations' },
  { title: 'Data Structures', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '11685 Registrations' },
  { title: 'Python', time: '30 Minutes', objective: 5, programming: 2, type: 'coding', registrations: '12220 Registrations' },
  { title: 'Node.js', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '759 Registrations' },
  { title: 'AWS', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '1243 Registrations' },
  { title: 'Software Testing', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '1817 Registrations' },
  { title: 'DBMS-', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '1754 Registrations' },
  { title: 'REST API', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '581 Registrations' },
  { title: 'C#', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '795 Registrations' },
  { title: 'Java 8', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '1965 Registrations' },
  { title: 'OS', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '963 Registrations' },
  { title: 'C', time: '30 Minutes', objective: 5, programming: 2, type: 'coding', registrations: '2441 Registrations' },
  { title: 'Networking', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '1519 Registrations' },
  { title: 'Spring Boot', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '957 Registrations' },
  { title: 'Data Science', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '727 Registrations' },
  { title: 'Machine Learning', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '940 Registrations' },
  { title: 'Cloud Computing', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '503 Registrations' },
  { title: 'CSS', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '1469 Registrations' },
  { title: 'Android', time: '30 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: null },
  { title: 'DSML', time: '30 Minutes', objective: 10, programming: 0, type: 'mcq', registrations: null, popular: true },
  { title: 'PHP', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Data Analyst', time: '60 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: null },
  { title: 'Agile', time: '60 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: null },
  { title: 'Linux', time: '60 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '596 Registrations' },
  { title: 'iOS', time: '60 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: null },
  { title: 'MySQL', time: '60 Minutes', objective: 15, programming: 0, type: 'mcq', registrations: '745 Registrations' },
  { title: 'Microservices', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Kotlin', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'PL/SQL', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'GIT', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Django', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Multithreading', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'React Native', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'MongoDB', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Java Collections', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Jquery', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Angular 8', time: '60 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Uber', time: '45 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Linkedin', time: '45 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null },
  { title: 'Infosys', time: '45 Minutes', objective: 5, programming: 2, type: 'coding', registrations: '582 Registrations' },
  { title: 'MindTree', time: '45 Minutes', objective: 5, programming: 2, type: 'coding', registrations: null }
];

const seedMocks = async () => {
  try {
    // 1. Find or create MOCKS subject
    let subject = await Subject.findOne({ code: 'MOCKS' });
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.findOne({});
    }

    if (!instructor) {
      console.log('Skipping mock seeding: No users found in database to assign as createdBy');
      return;
    }

    if (!subject) {
      subject = await Subject.create({
        name: 'Mock Assessments',
        code: 'MOCKS',
        description: 'Standard practice coding and objective mocks.',
        createdBy: instructor._id
      });
    }

    // 2. Find or create default questions for mocks
    let defaultMcq = await MCQQuestion.findOne({ subject: subject._id });
    if (!defaultMcq) {
      defaultMcq = await MCQQuestion.create({
        question: 'Which of the following is true about programming language compilation?',
        options: [
          'Compilers convert starter scripts directly to hardware signals.',
          'Interpreters compile code ahead of time.',
          'Compilers convert source code to machine code before execution.',
          'None of the choices.'
        ],
        correctAnswerIndex: 2,
        marks: 5,
        difficulty: 'easy',
        subject: subject._id,
        topic: 'General',
        createdBy: instructor._id
      });
    }

    let defaultCoding = await CodingQuestion.findOne({ subject: subject._id });
    if (!defaultCoding) {
      defaultCoding = await CodingQuestion.create({
        title: 'Reverse a String',
        description: 'Write a program that takes a string input and prints its reversed equivalent to standard output.',
        constraints: '1 <= string.length <= 1000',
        sampleInput: 'hello',
        sampleOutput: 'olleh',
        testCases: [
          { input: 'hello', expectedOutput: 'olleh', isSample: true },
          { input: 'AssessLMS', expectedOutput: 'SMLssessA', isSample: false }
        ],
        templates: [
          {
            language: 'javascript',
            starterCode: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input.split('').reverse().join(''));`
          }
        ],
        marks: 20,
        difficulty: 'easy',
        subject: subject._id,
        createdBy: instructor._id
      });
    }

    // 3. Seed mock assessments
    for (const t of mockTemplates) {
      const exists = await Assessment.findOne({ title: t.title, isMock: true });
      if (!exists) {
        const durationMinutes = parseInt(t.time);
        
        let questions = [];
        if (t.type === 'coding') {
          questions.push({ questionId: defaultCoding._id, questionModel: 'CodingQuestion' });
        } else {
          questions.push({ questionId: defaultMcq._id, questionModel: 'MCQQuestion' });
        }

        await Assessment.create({
          title: t.title,
          description: `Evaluate and practice your ${t.title} skills with this simulated mock assessment environment.`,
          subject: subject._id,
          type: t.type,
          duration: isNaN(durationMinutes) ? 45 : durationMinutes,
          passingScore: 40,
          totalMarks: t.type === 'coding' ? 20 : 5,
          questions,
          creator: instructor._id,
          isActive: true,
          isMock: true,
          dueDate: new Date('2036-12-31T23:59:59Z') // far future
        });
      }
    }
    console.log(`Mock assessments seeded successfully.`);
  } catch (err) {
    console.error('Error seeding mock assessments:', err);
  }
};

module.exports = seedMocks;
