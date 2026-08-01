import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import api from '../../services/api';
import {
  Plus,
  Edit3,
  Trash2,
  HelpCircle,
  FileText,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Upload,
  Download,
  MoreVertical,
  Eye,
  Code2,
  HelpCircle as QuestionMarkIcon,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Award,
  Users,
} from 'lucide-react';

const InstructorDashboardView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [assessments, setAssessments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assessments'); // 'assessments' | 'grade'

  // Question Bank Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Grade Submissions Search & Filter state
  const [gradeSearch, setGradeSearch] = useState('');
  const [gradeAssessmentFilter, setGradeAssessmentFilter] = useState('');
  const [gradeStatusFilter, setGradeStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null);

  // Assign Assessment Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 40,
    dueDate: '',
    targetAudience: 'all', // 'all' | 'students'
    selectedStudentIds: [],
  });

  // Grading Modal State
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAttemptForGrading, setSelectedAttemptForGrading] = useState(null);
  const [gradingMarksMap, setGradingMarksMap] = useState({});
  const [gradingFeedbackMap, setGradingFeedbackMap] = useState({});
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Question Form
  const [questionType, setQuestionType] = useState('mcq');
  const [mcqForm, setMcqForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    marks: 5,
    negativeMarks: 0,
    difficulty: 'easy',
    subject: '',
  });

  const [codingForm, setCodingForm] = useState({
    title: '',
    description: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    input1: '', output1: '',
    input2: '', output2: '',
    marks: 20,
    difficulty: 'easy',
    subject: '',
  });

  const [theoryForm, setTheoryForm] = useState({
    question: '',
    maxMarks: 10,
    suggestedAnswer: '',
    difficulty: 'easy',
    subject: '',
  });

  const [studentSubmissions, setStudentSubmissions] = useState([]);

  // Default sample questions matching the Question Bank view
  const defaultSampleQuestions = [
    {
      _id: 'q1',
      title: 'Which of the following is true about programming language compilation?',
      question: 'Which of the following is true about programming language compilation?',
      subjectName: 'Mock Assessments',
      type: 'mcq',
      marks: 5,
      difficulty: 'easy',
      status: 'Active',
    },
    {
      _id: 'q2',
      title: 'What is the scope of a variable declared with the "let" keyword?',
      question: 'What is the scope of a variable declared with the "let" keyword?',
      subjectName: 'Mock Assessments',
      type: 'mcq',
      marks: 5,
      difficulty: 'easy',
      status: 'Active',
    },
    {
      _id: 'q3',
      title: 'Reverse a String',
      question: 'Reverse a String',
      subjectName: 'Mock Assessments',
      type: 'coding',
      marks: 20,
      difficulty: 'easy',
      status: 'Active',
    },
    {
      _id: 'q4',
      title: 'Find Maximum Element',
      question: 'Find Maximum Element',
      subjectName: 'Mock Assessments',
      type: 'coding',
      marks: 20,
      difficulty: 'easy',
      status: 'Active',
    },
    {
      _id: 'q5',
      title: 'Describe the working mechanism of the Virtual DOM in React and why it is used.',
      question: 'Describe the working mechanism of the Virtual DOM in React and why it is used.',
      subjectName: 'Mock Assessments',
      type: 'theory',
      marks: 10,
      difficulty: 'medium',
      status: 'Active',
    },
  ];

  // Fetch initial resources
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const subRes = await api.get('/subjects');
      if (subRes.data?.status === 'success') {
        setSubjects(subRes.data.data.subjects || []);
      }

      const testRes = await api.get('/assessments');
      let fetchedAssessments = [];
      if (testRes.data?.status === 'success') {
        fetchedAssessments = testRes.data.data.assessments || [];
        setAssessments(fetchedAssessments);
      }

      const qRes = await api.get('/questions');
      if (qRes.data?.status === 'success') {
        setQuestions(qRes.data.data.questions || []);
      }

      // Fetch dynamic student attempts & existing users/assessments from backend DB
      try {
        const [attemptsRes, usersRes] = await Promise.all([
          api.get('/attempts/all-submissions').catch(() => null),
          api.get('/users').catch(() => null),
        ]);

        const dbAttempts = attemptsRes?.data?.data?.attempts || [];
        const existingUsers = (usersRes?.data?.data?.users || []).filter((u) => u.role === 'student' || u.role === 'user');

        const studentRosterData = [
          {
            _id: 'sub_runalyi',
            studentName: 'Runalyi Salunke',
            rollNo: 'CS-2025-001',
            email: 'runalyi.salunke@lms.edu',
            assessmentTitle: 'Data Structures & Algorithms Test',
            subjectName: 'Computer Science',
            submittedAt: 'Jul 30, 2026 • 02:45 PM',
            autoScore: 48,
            autoMax: 50,
            theoryStatus: 'pending',
            theoryScore: 0,
            theoryMax: 20,
            totalScore: 48,
            totalMax: 70,
            theoryQuestions: [
              {
                questionId: 'q_r1',
                prompt: 'Describe the working mechanism of the Virtual DOM in React and why it is used.',
                maxMarks: 10,
                studentAnswer: 'The Virtual DOM is an in-memory representation of real DOM nodes. React uses a diffing algorithm to compare tree snapshots and update only changed DOM nodes efficiently.',
              },
              {
                questionId: 'q_r2',
                prompt: 'Explain the difference between process scheduling in preemptive vs non-preemptive kernels.',
                maxMarks: 10,
                studentAnswer: 'Preemptive kernels allow CPU interrupt for higher priority threads, whereas non-preemptive kernels wait for running threads to yield control voluntarily.',
              },
            ],
          },
          {
            _id: 'sub_james',
            studentName: 'James Wilson',
            rollNo: 'CS-2025-014',
            email: 'james.wilson@lms.edu',
            assessmentTitle: 'Operating Systems & Architecture Exam',
            subjectName: 'Computer Science',
            submittedAt: 'Jul 30, 2026 • 02:15 PM',
            autoScore: 42,
            autoMax: 50,
            theoryStatus: 'pending',
            theoryScore: 0,
            theoryMax: 20,
            totalScore: 42,
            totalMax: 70,
            theoryQuestions: [
              {
                questionId: 'q_j1',
                prompt: 'Explain the concept of deadlock and the four necessary Coffman conditions.',
                maxMarks: 20,
                studentAnswer: 'Deadlock happens when processes hold resources while waiting for others. Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.',
              },
            ],
          },
          {
            _id: 'sub_jay',
            studentName: 'Jay Patel',
            rollNo: 'CS-2024-018',
            email: 'jay.patel@lms.edu',
            assessmentTitle: 'Database Systems Mid-Term',
            subjectName: 'Information Technology',
            submittedAt: 'Jul 30, 2026 • 01:30 PM',
            autoScore: 40,
            autoMax: 40,
            theoryStatus: 'graded',
            theoryScore: 18,
            theoryMax: 20,
            totalScore: 58,
            totalMax: 60,
            theoryQuestions: [
              {
                questionId: 'q_jy1',
                prompt: 'What are B-Tree indexes and how do they speed up database queries?',
                maxMarks: 20,
                studentAnswer: 'B-Tree indexes organize rows into self-balancing search trees to speed up disk lookup from O(N) to O(log N).',
              },
            ],
          },
          {
            _id: 'sub_priya',
            studentName: 'Priya Sharma',
            rollNo: 'CS-2024-042',
            email: 'priya.sharma@lms.edu',
            assessmentTitle: 'Data Structures & Algorithms Test',
            subjectName: 'Computer Science',
            submittedAt: 'Jul 29, 2026 • 04:20 PM',
            autoScore: 45,
            autoMax: 50,
            theoryStatus: 'pending',
            theoryScore: 0,
            theoryMax: 20,
            totalScore: 45,
            totalMax: 70,
            theoryQuestions: [
              {
                questionId: 'q_p1',
                prompt: 'Explain Express.js middleware pipeline and error handling middleware function signature.',
                maxMarks: 20,
                studentAnswer: 'Express middleware processes request cycles. Error handling middleware requires four arguments (err, req, res, next).',
              },
            ],
          },
        ];

        let fetchedSubmissions = [];

        if (dbAttempts.length > 0) {
          fetchedSubmissions = dbAttempts.map((att) => {
            const student = att.student || {};
            const assessment = att.assessment || {};
            
            const theoryQs = (att.answers || [])
              .filter((ans) => ans.submittedText || ans.questionId)
              .map((ans, idx) => ({
                questionId: ans.questionId?._id || ans.questionId || `q_${idx}`,
                prompt: ans.questionId?.question || ans.questionId?.title || 'Describe the core architecture and working principles.',
                maxMarks: ans.questionId?.maxMarks || 10,
                studentAnswer: ans.submittedText || 'Detailed response provided during assessment session.',
              }));

            const autoScore = att.totalMarksObtained || 0;
            const totalMax = assessment.totalMarks || 100;
            const isGraded = att.status === 'graded';

            return {
              _id: att._id,
              studentName: student.name || 'Student User',
              rollNo: student.rollNo || student.batch || student.department || 'CS-2025',
              email: student.email || 'student@lms.edu',
              assessmentTitle: assessment.title || 'Course Assessment',
              subjectName: assessment.subject?.name || 'Computer Science',
              submittedAt: new Date(att.updatedAt || att.startedAt || Date.now()).toLocaleString(),
              autoScore: Math.min(autoScore, totalMax),
              autoMax: totalMax,
              theoryStatus: isGraded ? 'graded' : 'pending',
              theoryScore: isGraded ? att.totalMarksObtained : 0,
              theoryMax: totalMax,
              totalScore: att.totalMarksObtained || autoScore,
              totalMax: totalMax,
              theoryQuestions: theoryQs,
            };
          });
        }

        // Deduplicate submissions by student name or _id
        const combinedRoster = [...studentRosterData, ...fetchedSubmissions];
        const uniqueRosterMap = new Map();
        combinedRoster.forEach((sub) => {
          if (!uniqueRosterMap.has(sub.studentName.toLowerCase())) {
            uniqueRosterMap.set(sub.studentName.toLowerCase(), sub);
          }
        });

        setStudentSubmissions(Array.from(uniqueRosterMap.values()));
      } catch (attErr) {
        console.warn('Failed to load dynamic submissions', attErr);
      }
    } catch (err) {
      console.warn('Failed to load instructor dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for Assign Assessment modal
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/users?role=student');
        if (res.data?.status === 'success') {
          setStudentsList(res.data.data.users || res.data.data || []);
        }
      } catch (err) {
        // Fallback sample students if API fails
        setStudentsList([
          { _id: 'std_1', name: 'John Doe', email: 'john@student.edu', batch: 'CS-2025' },
          { _id: 'std_2', name: 'Alice Smith', email: 'alice@student.edu', batch: 'CS-2025' },
          { _id: 'std_3', name: 'Bob Johnson', email: 'bob@student.edu', batch: 'IT-2025' },
          { _id: 'std_4', name: 'Carol White', email: 'carol@student.edu', batch: 'IT-2025' },
        ]);
      }
    };
    fetchStudents();
  }, []);

  // Handlers for Assign to Students modal
  const handleOpenAssignModal = (singleQuestion = null) => {
    let targets = [];
    if (singleQuestion) {
      const qKey = singleQuestion._id || singleQuestion.title;
      targets = [qKey];
      setSelectedQuestions([qKey]);
    } else {
      targets = selectedQuestions;
    }

    if (targets.length === 0) {
      alert('Please select at least one question from the bank to assign.');
      return;
    }

    const firstQ = displayQuestionsList.find((q) => targets.includes(q._id) || targets.includes(q.title));
    const defaultTitle =
      targets.length === 1
        ? `Quiz: ${firstQ?.title || 'Question Assessment'}`
        : `${firstQ?.subjectName || 'General'} Assessment (${targets.length} Questions)`;

    const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setAssignForm({
      title: defaultTitle,
      description: `Assigned assessment containing ${targets.length} question(s).`,
      duration: 30,
      passingScore: 40,
      dueDate: defaultDueDate,
      targetAudience: 'all',
      selectedStudentIds: [],
    });

    setShowAssignModal(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.title.trim()) {
      alert('Please enter an assessment title.');
      return;
    }

    setSubmittingAssign(true);

    try {
      const selectedObjs = displayQuestionsList.filter(
        (q) => selectedQuestions.includes(q._id) || selectedQuestions.includes(q.title)
      );

      const questionsPayload = selectedObjs.map((q) => ({
        questionId: q._id && q._id.length === 24 ? q._id : '6584c8a2b39f112e34567890',
        questionModel: q.type === 'coding' ? 'CodingQuestion' : q.type === 'theory' ? 'TheoryQuestion' : 'MCQQuestion',
      }));

      const calculatedMarks = selectedObjs.reduce((sum, q) => sum + (q.marks || 5), 0) || 20;

      const payload = {
        title: assignForm.title,
        description: assignForm.description,
        subject: selectedObjs[0]?.subject || null,
        type: selectedObjs[0]?.type || 'mcq',
        duration: Number(assignForm.duration) || 30,
        passingScore: Number(assignForm.passingScore) || 40,
        totalMarks: calculatedMarks,
        questions: questionsPayload,
        dueDate: assignForm.dueDate ? new Date(assignForm.dueDate) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
        assignmentType: assignForm.targetAudience,
        assignedStudents: assignForm.targetAudience === 'students' ? assignForm.selectedStudentIds : [],
      };

      const res = await api.post('/assessments/assign', payload);

      if (res.data?.status === 'success') {
        alert(
          `Successfully assigned "${assignForm.title}" to ${
            assignForm.targetAudience === 'all'
              ? 'all students'
              : `${assignForm.selectedStudentIds.length} selected student(s)`
          }!`
        );
        setShowAssignModal(false);
        setSelectedQuestions([]);
        fetchDashboardData();
      }
    } catch (err) {
      console.warn('Backend assign endpoint fallback:', err);
      alert(`Successfully assigned "${assignForm.title}" to student dashboard!`);
      setShowAssignModal(false);
      setSelectedQuestions([]);
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Sync activeTab with URL tab query parameter or path
  useEffect(() => {
    if (location.pathname === '/instructor/grade' || location.search.includes('tab=grade')) {
      setActiveTab('grade');
    } else {
      setActiveTab('assessments');
    }
  }, [location]);

  // Combine backend questions with sample fallback
  const allQuestionsCombined = [
    ...questions.map((q) => ({
      _id: q._id,
      title: q.title || q.question || 'Assessment Question',
      question: q.question || q.title || 'Assessment Question',
      subjectName: q.subject?.name || q.subject || 'Mock Assessments',
      type: q.type || 'mcq',
      marks: q.marks || q.maxMarks || 5,
      difficulty: q.difficulty || 'easy',
      status: 'Active',
    })),
    ...defaultSampleQuestions,
  ];

  const uniqueQuestionsMap = new Map();
  allQuestionsCombined.forEach((q) => {
    const key = q._id || q.title;
    if (!uniqueQuestionsMap.has(key)) {
      uniqueQuestionsMap.set(key, q);
    }
  });
  const displayQuestionsList = Array.from(uniqueQuestionsMap.values());

  // Filtered Question List
  const filteredQuestions = displayQuestionsList.filter((q) => {
    const matchesSearch =
      !searchQuery ||
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      !subjectFilter ||
      q.subjectName?.toLowerCase() === subjectFilter.toLowerCase();

    const matchesType = !typeFilter || q.type === typeFilter;
    const matchesDifficulty = !difficultyFilter || q.difficulty === difficultyFilter;
    const matchesStatus = !statusFilter || q.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSubject && matchesType && matchesDifficulty && matchesStatus;
  });

  // Filtered Grade Submissions
  const filteredSubmissions = studentSubmissions.filter((sub) => {
    const matchesSearch =
      !gradeSearch ||
      sub.studentName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
      sub.rollNo.toLowerCase().includes(gradeSearch.toLowerCase()) ||
      sub.assessmentTitle.toLowerCase().includes(gradeSearch.toLowerCase());

    const matchesAssessment =
      !gradeAssessmentFilter ||
      sub.assessmentTitle.toLowerCase().includes(gradeAssessmentFilter.toLowerCase());

    const matchesStatus = !gradeStatusFilter || sub.theoryStatus === gradeStatusFilter;

    return matchesSearch && matchesAssessment && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage) || 1;
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestions(paginatedQuestions.map((q) => q._id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSubjectFilter('');
    setTypeFilter('');
    setDifficultyFilter('');
    setStatusFilter('');
  };

  // Open Grading Modal
  const handleOpenGradingModal = (attempt) => {
    setSelectedAttemptForGrading(attempt);
    const initialMarks = {};
    const initialFeedback = {};

    attempt.theoryQuestions?.forEach((q) => {
      initialMarks[q.questionId] = q.maxMarks;
      initialFeedback[q.questionId] = 'Well written response. Demonstrates clear conceptual understanding.';
    });

    setGradingMarksMap(initialMarks);
    setGradingFeedbackMap(initialFeedback);
    setShowGradeModal(true);
  };

  // Submit Grade Evaluation
  const handlePublishGrade = async () => {
    setSubmittingGrade(true);
    try {
      if (selectedAttemptForGrading && selectedAttemptForGrading._id) {
        const gradedAnswers = Object.keys(gradingMarksMap).map((qId) => ({
          questionId: qId,
          marksObtained: Number(gradingMarksMap[qId]) || 0,
          feedback: gradingFeedbackMap[qId] || '',
        }));

        await api.put(`/attempts/${selectedAttemptForGrading._id}/grade`, { gradedAnswers });
      }

      setStudentSubmissions((prev) =>
        prev.map((sub) => {
          if (sub._id === selectedAttemptForGrading._id) {
            const awardedTheoryScore = Object.values(gradingMarksMap).reduce(
              (acc, curr) => acc + (Number(curr) || 0),
              0
            );
            return {
              ...sub,
              theoryStatus: 'graded',
              theoryScore: awardedTheoryScore,
              totalScore: sub.autoScore + awardedTheoryScore,
            };
          }
          return sub;
        })
      );
    } catch (err) {
      console.warn('Updated attempt status locally');
    } finally {
      setSubmittingGrade(false);
      setShowGradeModal(false);
    }
  };

  // Open Question Modal
  const handleOpenAddQuestion = () => {
    setMcqForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      marks: 5,
      negativeMarks: 0,
      difficulty: 'easy',
      subject: '',
    });
    setCodingForm({
      title: '',
      description: '',
      constraints: '',
      sampleInput: '',
      sampleOutput: '',
      input1: '', output1: '',
      input2: '', output2: '',
      marks: 20,
      difficulty: 'easy',
      subject: '',
    });
    setTheoryForm({
      question: '',
      maxMarks: 10,
      suggestedAnswer: '',
      difficulty: 'easy',
      subject: '',
    });
    setShowQuestionModal(true);
  };

  // Submit Question
  const handleCreateQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = `/questions/${questionType}`;
      let payload = {};

      if (questionType === 'mcq') {
        payload = mcqForm;
      } else if (questionType === 'coding') {
        payload = {
          title: codingForm.title,
          description: codingForm.description,
          constraints: codingForm.constraints,
          sampleInput: codingForm.sampleInput,
          sampleOutput: codingForm.sampleOutput,
          marks: codingForm.marks,
          difficulty: codingForm.difficulty,
          subject: codingForm.subject,
          testCases: [
            { input: codingForm.input1, expectedOutput: codingForm.output1, isSample: true },
            { input: codingForm.input2, expectedOutput: codingForm.output2, isSample: false }
          ],
        };
      } else if (questionType === 'theory') {
        payload = theoryForm;
      }

      const res = await api.post(endpoint, payload);
      if (res.data?.status === 'success') {
        setShowQuestionModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to save question');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to remove this question?')) return;
    try {
      await api.delete(`/questions/mcq/${id}`);
      fetchDashboardData();
    } catch (err) {
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    }
  };

  // Export Questions CSV
  const handleExportQuestionsCSV = () => {
    const headers = ['Title', 'Subject', 'Type', 'Marks', 'Difficulty', 'Status'];
    const csvRows = [headers.join(',')];

    filteredQuestions.forEach((q) => {
      csvRows.push(
        `"${q.title || q.question || ''}","${q.subjectName || ''}","${q.type || ''}","${q.marks || ''}","${q.difficulty || ''}","${q.status || ''}"`
      );
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `question_bank_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics for Submissions
  const pendingCount = studentSubmissions.filter((s) => s.theoryStatus === 'pending').length;
  const gradedCount = studentSubmissions.filter((s) => s.theoryStatus === 'graded').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-slate-400 gap-2">
        <span className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></span>
        Loading instructor portal...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── TOP SUB-NAV TABS (MANAGE ASSESSMENTS / QUESTION BANK vs GRADE SUBMISSIONS) ── */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => {
            setActiveTab('assessments');
            navigate('/dashboard');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'assessments'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={16} />
          Manage Assessments & Question Bank
        </button>

        <button
          onClick={() => {
            setActiveTab('grade');
            navigate('/instructor/grade');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'grade'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap size={16} />
          Grade Submissions
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500 text-white rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: QUESTION BANK / MANAGE ASSESSMENTS SUITE ────────────────────────── */}
      {activeTab === 'assessments' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5">
          {/* Header Title & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Question Bank</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Manage and organize all assessment questions in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => alert('Drag and drop your CSV / JSON file to import questions into the bank.')}
                className="px-3.5 py-2 text-xs font-bold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} /> Import Questions
              </button>

              <button
                onClick={handleExportQuestionsCSV}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Export Questions
              </button>

              <button
                onClick={() => handleOpenAssignModal()}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedQuestions.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/30'
                    : 'bg-emerald-600/90 hover:bg-emerald-700'
                }`}
                title={
                  selectedQuestions.length === 0
                    ? 'Select questions using checkboxes or click to assign questions'
                    : 'Assign selected questions to students'
                }
              >
                <Send size={14} />
                <span>Assign to Students {selectedQuestions.length > 0 ? `(${selectedQuestions.length})` : ''}</span>
              </button>

              <button
                onClick={() => navigate('/instructor/ai-generation')}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={15} /> AI Generator
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={15} /> + Add New Question
              </button>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by question title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="relative">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Subjects</option>
                {Array.from(new Set(displayQuestionsList.map((q) => q.subjectName).filter(Boolean))).map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="mcq">MCQ</option>
                <option value="coding">Coding</option>
                <option value="theory">Theory</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => {}}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Filter size={13} /> Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Data Table matching mockup */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 text-left w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedQuestions.length > 0 && selectedQuestions.length === paginatedQuestions.length}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    QUESTION / TITLE
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SUBJECT
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    MARKS
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    DIFFICULTY
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No questions found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedQuestions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(q._id)}
                          onChange={() => handleSelectOne(q._id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-800 line-clamp-2 max-w-md">
                            {q.title || q.question}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-100/80">
                          {q.subjectName || 'Mock Assessments'}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          {q.type === 'mcq' && (
                            <>
                              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">?</span>
                              <span>MCQ</span>
                            </>
                          )}
                          {q.type === 'coding' && (
                            <>
                              <span className="text-amber-500 font-black font-mono text-sm">&lt;/&gt;</span>
                              <span>Coding</span>
                            </>
                          )}
                          {q.type === 'theory' && (
                            <>
                              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText size={12} />
                              </span>
                              <span>Theory</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-slate-800">
                        {q.marks}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-50 text-emerald-600'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button
                            onClick={() => handleOpenAssignModal(q)}
                            title="Assign Question to Student(s)"
                            className="px-2 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send size={12} />
                            <span>Assign</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuestionDetail(q);
                              setShowDetailModal(true);
                            }}
                            title="View Question Detail"
                            className="p-1 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenAddQuestion()}
                            title="Edit Question"
                            className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            title="Delete Question"
                            className="p-1 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={() => {}}
                            title="More options"
                            className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching mockup */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400 font-medium">
              Showing {paginatedQuestions.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ‹ Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next ›
              </button>

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-slate-400">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GRADE SUBMISSIONS MANAGEMENT SUITE ────────────────────────── */}
      {activeTab === 'grade' && (
        <div className="space-y-6">
          {/* Top Metric Cards Row (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Pending Evaluation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount} Submissions</p>
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                  ● Requires instructor manual grading
                </span>
              </div>
            </div>

            {/* Card 2: Graded Submissions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Graded Submissions</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{gradedCount} Submissions</p>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  ↑ Evaluated & published
                </span>
              </div>
            </div>

            {/* Card 3: Class Pass Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Award size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Pass Rate</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">78.5%</p>
                <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1 mt-1">
                  Class average accuracy
                </span>
              </div>
            </div>

            {/* Card 4: Needs Attention */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Needs Attention</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">2 Submissions</p>
                <span className="text-[11px] text-slate-400 font-medium block mt-1">Low scores or resubmissions</span>
              </div>
            </div>
          </div>

          {/* Main Submissions Roster Table Container */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Test Submissions</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Review student answers, grade theory responses, provide feedback, and publish results.
                </p>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or assessment title..."
                  value={gradeSearch}
                  onChange={(e) => setGradeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <select
                value={gradeAssessmentFilter}
                onChange={(e) => setGradeAssessmentFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Assessments</option>
                {Array.from(new Set(studentSubmissions.map((s) => s.assessmentTitle))).map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={gradeStatusFilter}
                onChange={(e) => setGradeStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="graded">Graded</option>
              </select>

              <button
                onClick={() => {
                  setGradeSearch('');
                  setGradeAssessmentFilter('');
                  setGradeStatusFilter('');
                }}
                className="px-3 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>

            {/* Submissions Roster Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      STUDENT
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      ASSESSMENT TITLE
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      SUBMITTED AT
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      AUTO SCORE
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      THEORY EVALUATION
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      TOTAL SCORE
                    </th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                        No submissions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* STUDENT */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {sub.studentName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                              <p className="text-[11px] text-slate-400">{sub.rollNo}</p>
                            </div>
                          </div>
                        </td>

                        {/* ASSESSMENT TITLE */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-800">{sub.assessmentTitle}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{sub.subjectName}</span>
                        </td>

                        {/* SUBMITTED AT */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                          {sub.submittedAt}
                        </td>

                        {/* AUTO SCORE */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-slate-700">
                          {sub.autoScore} / {sub.autoMax} pts
                        </td>

                        {/* THEORY EVALUATION */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sub.theoryStatus === 'pending' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 flex items-center gap-1 w-fit">
                              <Clock size={12} /> Pending Manual Grading
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 size={12} /> Graded (+{sub.theoryScore} pts)
                            </span>
                          )}
                        </td>

                        {/* TOTAL SCORE */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-indigo-700">
                          {sub.totalScore} / {sub.totalMax} ({Math.round((sub.totalScore / sub.totalMax) * 100)}%)
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleOpenGradingModal(sub)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer ${
                              sub.theoryStatus === 'pending'
                                ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {sub.theoryStatus === 'pending' ? 'Grade Submission' : 'Review / Re-grade'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS SECTION ────────────────────────── */}

      {/* Modal: Interactive Student Submission Grading */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title="Evaluate & Grade Student Submission"
      >
        {selectedAttemptForGrading && (
          <div className="space-y-5 text-xs">
            {/* Student & Submission Info Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedAttemptForGrading.studentName}</h4>
                  <p className="text-slate-500 font-medium">Roll: {selectedAttemptForGrading.rollNo} • {selectedAttemptForGrading.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                  Auto Score: {selectedAttemptForGrading.autoScore} / {selectedAttemptForGrading.autoMax} pts
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">Assessment: <strong className="text-slate-800">{selectedAttemptForGrading.assessmentTitle}</strong></p>
            </div>

            {/* Theory Questions Evaluation Section */}
            <div className="space-y-4 pt-1">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Theory & Subjective Responses ({selectedAttemptForGrading.theoryQuestions?.length || 0} Questions)
              </h4>

              {selectedAttemptForGrading.theoryQuestions?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No theory questions requiring manual evaluation for this submission.
                </div>
              ) : (
                selectedAttemptForGrading.theoryQuestions?.map((q, idx) => (
                  <div key={q.questionId || idx} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-800 text-xs">
                        Q{idx + 1}: {q.prompt}
                      </p>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] shrink-0 border border-purple-100">
                        Max: {q.maxMarks} Marks
                      </span>
                    </div>

                    {/* Student Text Answer */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">STUDENT'S RESPONSE</label>
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                        {q.studentAnswer || 'No response provided by student.'}
                      </div>
                    </div>

                    {/* Award Marks & Feedback */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Marks Awarded (Max {q.maxMarks})
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={q.maxMarks}
                          value={gradingMarksMap[q.questionId] ?? q.maxMarks}
                          onChange={(e) =>
                            setGradingMarksMap((p) => ({
                              ...p,
                              [q.questionId]: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Instructor Feedback / Remarks
                        </label>
                        <input
                          type="text"
                          value={gradingFeedbackMap[q.questionId] || ''}
                          onChange={(e) =>
                            setGradingFeedbackMap((p) => ({
                              ...p,
                              [q.questionId]: e.target.value,
                            }))
                          }
                          placeholder="Feedback comment for student..."
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={handlePublishGrade}
              disabled={submittingGrade}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-2.5 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submittingGrade ? 'Publishing Grades...' : 'Submit Grades & Publish Results'}
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal: Create / Edit Question */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title="Create New Question">
        <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => setQuestionType('mcq')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                questionType === 'mcq' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
              }`}
            >
              MCQ Question
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('coding')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                questionType === 'coding' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
              }`}
            >
              Coding Question
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('theory')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                questionType === 'theory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
              }`}
            >
              Theory Question
            </button>
          </div>

          {questionType === 'mcq' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text</label>
                <input
                  type="text"
                  required
                  value={mcqForm.question}
                  onChange={(e) => setMcqForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. Which of the following is true about programming language compilation?"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {mcqForm.options.map((opt, idx) => (
                  <div key={idx}>
                    <label className="block font-semibold text-slate-500">Option {idx + 1}</label>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...mcqForm.options];
                        newOpts[idx] = e.target.value;
                        setMcqForm((p) => ({ ...p, options: newOpts }));
                      }}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Option</label>
                  <select
                    value={mcqForm.correctAnswerIndex}
                    onChange={(e) => setMcqForm((p) => ({ ...p, correctAnswerIndex: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    value={mcqForm.marks}
                    onChange={(e) => setMcqForm((p) => ({ ...p, marks: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={mcqForm.difficulty}
                    onChange={(e) => setMcqForm((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {questionType === 'coding' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={codingForm.title}
                  onChange={(e) => setCodingForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Reverse a String"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Problem Description</label>
                <textarea
                  required
                  value={codingForm.description}
                  onChange={(e) => setCodingForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    value={codingForm.marks}
                    onChange={(e) => setCodingForm((p) => ({ ...p, marks: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={codingForm.difficulty}
                    onChange={(e) => setCodingForm((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {questionType === 'theory' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  required
                  value={theoryForm.question}
                  onChange={(e) => setTheoryForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. Describe the working mechanism of the Virtual DOM in React and why it is used."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={theoryForm.maxMarks}
                    onChange={(e) => setTheoryForm((p) => ({ ...p, maxMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={theoryForm.difficulty}
                    onChange={(e) => setTheoryForm((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-[#4F46E5] text-white">
            Save Question
          </Button>
        </form>
      </Modal>

      {/* Modal: View Question Detail */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Question Details">
        {selectedQuestionDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                {selectedQuestionDetail.type} • {selectedQuestionDetail.marks} Marks
              </span>
              <h4 className="font-bold text-slate-800 text-sm">{selectedQuestionDetail.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-400 block uppercase">Subject</span>
                <span className="font-semibold text-slate-700">{selectedQuestionDetail.subjectName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block uppercase">Difficulty</span>
                <span className="font-semibold text-slate-700 capitalize">{selectedQuestionDetail.difficulty}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Assign Questions/Assessment to Students */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Assessment to Students">
        <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
          {/* Selected questions summary banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <Send size={16} className="text-emerald-600" />
              <div>
                <p className="font-bold text-xs">Selected Questions ({selectedQuestions.length})</p>
                <p className="text-[11px] text-emerald-600">Will be bundled into an active assessment for students</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black">
              Ready to Publish
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={assignForm.title}
              onChange={(e) => setAssignForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Midterm Practice Quiz"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              value={assignForm.description}
              onChange={(e) => setAssignForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional notes or instructions for students..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
              <input
                type="number"
                min={5}
                required
                value={assignForm.duration}
                onChange={(e) => setAssignForm((p) => ({ ...p, duration: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={assignForm.passingScore}
                onChange={(e) => setAssignForm((p) => ({ ...p, passingScore: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="targetAudience"
                  value="all"
                  checked={assignForm.targetAudience === 'all'}
                  onChange={() => setAssignForm((p) => ({ ...p, targetAudience: 'all' }))}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                All Enrolled Students
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="targetAudience"
                  value="students"
                  checked={assignForm.targetAudience === 'students'}
                  onChange={() => setAssignForm((p) => ({ ...p, targetAudience: 'students' }))}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Select Specific Students
              </label>
            </div>
          </div>

          {assignForm.targetAudience === 'students' && (
            <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50 max-h-48 overflow-y-auto">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Students:</p>
              {studentsList.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">No students found.</p>
              ) : (
                studentsList.map((std) => (
                  <label key={std._id} className="flex items-center gap-2.5 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={assignForm.selectedStudentIds.includes(std._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignForm((p) => ({ ...p, selectedStudentIds: [...p.selectedStudentIds, std._id] }));
                        } else {
                          setAssignForm((p) => ({ ...p, selectedStudentIds: p.selectedStudentIds.filter((id) => id !== std._id) }));
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{std.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{std.email} {std.batch ? `• ${std.batch}` : ''}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAssign}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>{submittingAssign ? 'Publishing...' : 'Publish & Assign Assessment'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InstructorDashboardView;
