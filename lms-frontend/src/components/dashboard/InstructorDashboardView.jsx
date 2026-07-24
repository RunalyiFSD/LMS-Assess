import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import api from '../../services/api';
import { Plus, Edit3, Trash2, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

const InstructorDashboardView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attemptsToGrade, setAttemptsToGrade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assessments'); // 'assessments' | 'add_question' | 'grade'

  // Mock assessments states
  const [mockAssessments, setMockAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showMockEditModal, setShowMockEditModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [mockEditForm, setMockEditForm] = useState({
    duration: 30,
    passingScore: 40,
    totalMarks: 100,
  });
  const [tempQuestions, setTempQuestions] = useState([]);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Modal controls
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Forms
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'mcq',
    duration: 30,
    passingScore: 50,
    totalMarks: 100,
    dueDate: '',
  });

  const [questionType, setQuestionType] = useState('mcq');
  const [mcqForm, setMcqForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    marks: 5,
    negativeMarks: 0,
    difficulty: 'easy',
    subject: '',
    topic: '',
  });

  const [codingForm, setCodingForm] = useState({
    title: '',
    description: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    input1: '', output1: '', // testcase 1
    input2: '', output2: '', // testcase 2
    marks: 20,
    difficulty: 'easy',
    subject: '',
  });

  const [theoryForm, setTheoryForm] = useState({
    question: '',
    maxMarks: 10,
    suggestedAnswer: '',
    subject: '',
  });

  const [activeAttempt, setActiveAttempt] = useState(null);
  const [theoryGrades, setTheoryGrades] = useState([]);

  // Fetch initial resources
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const subRes = await api.get('/subjects');
      if (subRes.data?.status === 'success') {
        setSubjects(subRes.data.data.subjects || []);
      }

      const testRes = await api.get('/assessments');
      if (testRes.data?.status === 'success') {
        setAssessments(testRes.data.data.assessments || []);
      }

      const qRes = await api.get('/questions');
      if (qRes.data?.status === 'success') {
        setQuestions(qRes.data.data.questions || []);
      }
    } catch (err) {
      console.warn('Failed to load instructor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync activeTab with route path / search parameters
  useEffect(() => {
    if (location.pathname === '/instructor/questions') {
      if (activeTab !== 'add_question') {
        handleTabChange('add_question', false);
      }
    } else if (location.pathname === '/instructor/grade') {
      if (activeTab !== 'grade') {
        handleTabChange('grade', false);
      }
    } else {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      if (tab && ['assessments', 'add_question', 'mocks', 'grade'].includes(tab)) {
        if (activeTab !== tab) {
          handleTabChange(tab, false);
        }
      } else if (!tab && activeTab !== 'assessments') {
        handleTabChange('assessments', false);
      }
    }
  }, [location.pathname, location.search]);

  // Filter attempts when grading tab is selected
  const handleTabChange = async (tab, updateUrl = true) => {
    setActiveTab(tab);
    if (updateUrl) {
      if (tab === 'add_question') {
        navigate('/instructor/questions');
      } else if (tab === 'grade') {
        navigate('/instructor/grade');
      } else if (tab === 'assessments') {
        navigate('/dashboard');
      } else {
        navigate(`/dashboard?tab=${tab}`);
      }
    }
    if (tab === 'grade') {
      try {
        // Load all attempts for active assessments to identify theory papers that require manual review
        const allAttempts = [];
        for (const test of assessments) {
          if (test.type === 'theory') {
            const res = await api.get(`/attempts/assessment/${test._id}`);
            if (res.data?.status === 'success') {
              const list = res.data.data.attempts || [];
              allAttempts.push(...list.filter(a => a.status === 'submitted'));
            }
          }
        }
        setAttemptsToGrade(allAttempts);
      } catch (err) {
        console.warn('Failed to load grading list');
      }
    }
  };

  // Toggle active status
  const handleToggleActive = async (id, currentVal) => {
    try {
      await api.put(`/assessments/${id}`, { isActive: !currentVal });
      setAssessments((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: !currentVal } : t))
      );
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  // Create / Edit assessment
  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssessmentId) {
        const response = await api.put(`/assessments/${editingAssessmentId}`, assessmentForm);
        if (response.data?.status === 'success') {
          setShowAssessmentModal(false);
          setEditingAssessmentId(null);
          fetchDashboardData();
        }
      } else {
        const response = await api.post('/assessments', assessmentForm);
        if (response.data?.status === 'success') {
          setShowAssessmentModal(false);
          fetchDashboardData();
        }
      }
    } catch (err) {
      alert(err.message || 'Saving failed');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAssessmentId(null);
    setAssessmentForm({
      title: '',
      description: '',
      subject: '',
      type: 'mcq',
      duration: 30,
      passingScore: 50,
      totalMarks: 100,
      dueDate: '',
    });
    setShowAssessmentModal(true);
  };

  const handleOpenEditDetailsModal = (assessment) => {
    setEditingAssessmentId(assessment._id);
    // Format date string for datetime-local input (YYYY-MM-DDTHH:MM)
    let formattedDueDate = '';
    if (assessment.dueDate) {
      const date = new Date(assessment.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      formattedDueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    setAssessmentForm({
      title: assessment.title || '',
      description: assessment.description || '',
      subject: assessment.subject?._id || assessment.subject || '',
      type: assessment.type || 'mcq',
      duration: assessment.duration || 30,
      passingScore: assessment.passingScore || 50,
      totalMarks: assessment.totalMarks || 100,
      dueDate: formattedDueDate,
    });
    setShowAssessmentModal(true);
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment? This will permanently remove all student attempt records.')) return;
    try {
      await api.delete(`/assessments/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Deletion failed');
    }
  };

  // Create Question
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
          templates: [
            { language: 'javascript', starterCode: '// Write your javascript solution here' }
          ]
        };
      } else {
        payload = theoryForm;
      }

      const res = await api.post(endpoint, payload);
      if (res.data?.status === 'success') {
        setShowQuestionModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add question to bank');
    }
  };

  // Open Grade review
  const handleOpenGradeReview = (attempt) => {
    setActiveAttempt(attempt);
    // Initialize theory grades state
    const theoryAnswers = attempt.answers.filter((ans) => ans.submittedText !== undefined);
    setTheoryGrades(theoryAnswers.map(ans => ({
      questionId: ans.questionId,
      marksObtained: ans.suggestedScore || 0,
      feedback: '',
      submittedText: ans.submittedText
    })));
    setShowGradeModal(true);
  };

  // Submit manual grading overrides
  const handleGradingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/attempts/${activeAttempt._id}/grade`, {
        gradedAnswers: theoryGrades
      });
      if (res.data?.status === 'success') {
        setShowGradeModal(false);
        // refresh grade list
        setAttemptsToGrade((prev) => prev.filter(a => a._id !== activeAttempt._id));
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Grading failed');
    }
  };

  // Unified Questions Assignment Handlers
  const handleOpenQuestionsModal = async (assessment) => {
    setSelectedAssessment(assessment);
    try {
      const res = await api.get(`/assessments/${assessment._id}`);
      if (res.data?.status === 'success') {
        const fullAssessment = res.data.data.assessment;
        setTempQuestions(fullAssessment.questions || []);
      }
    } catch (err) {
      console.warn('Failed to load assessment details:', err);
      setTempQuestions(assessment.questions || []);
    }
    setShowQuestionsModal(true);
  };

  const handleAddQuestionToAssessment = (question) => {
    const alreadyExists = tempQuestions.some(q => {
      const id = q.questionId?._id || q.questionId;
      return id === question._id;
    });
    if (alreadyExists) {
      alert('Question is already in this assessment.');
      return;
    }

    let questionModel = 'MCQQuestion';
    if (question.type === 'coding') {
      questionModel = 'CodingQuestion';
    } else if (question.type === 'theory') {
      questionModel = 'TheoryQuestion';
    }

    setTempQuestions(prev => [
      ...prev,
      {
        questionId: question,
        questionModel
      }
    ]);
  };

  const handleRemoveQuestionFromAssessment = (questionId) => {
    setTempQuestions(prev => prev.filter(q => {
      const id = q.questionId?._id || q.questionId;
      return id !== questionId;
    }));
  };

  const handleQuestionsSave = async () => {
    try {
      const questionsPayload = tempQuestions.map(q => ({
        questionId: q.questionId?._id || q.questionId,
        questionModel: q.questionModel
      }));

      const res = await api.put(`/assessments/${selectedAssessment._id}`, {
        questions: questionsPayload
      });
      if (res.data?.status === 'success') {
        setShowQuestionsModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update questions.');
    }
  };

  // Mock edit handlers
  const handleOpenMockEdit = (mock) => {
    setSelectedAssessment(mock);
    setMockEditForm({
      duration: mock.duration,
      passingScore: mock.passingScore,
      totalMarks: mock.totalMarks,
    });
    setShowMockEditModal(true);
  };

  const handleMockEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/assessments/${selectedAssessment._id}`, mockEditForm);
      if (res.data?.status === 'success') {
        setShowMockEditModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update mock details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleTabChange('assessments')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'assessments'
            ? 'border-brand-500 text-brand-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          Manage Assessments
        </button>
        <button
          onClick={() => handleTabChange('add_question')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'add_question'
            ? 'border-brand-500 text-brand-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          Question Bank
        </button>
        <button
          onClick={() => handleTabChange('mocks')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'mocks'
            ? 'border-brand-500 text-brand-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          Mock Assessments
        </button>
        <button
          onClick={() => handleTabChange('grade')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'grade'
            ? 'border-brand-500 text-brand-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          Review Submissions
          {attemptsToGrade.length > 0 && (
            <span className="w-4.5 h-4.5 text-[10px] font-bold bg-accent-warning text-white rounded-full flex items-center justify-center animate-pulse">
              {attemptsToGrade.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Assessments Dashboard */}
      {activeTab === 'assessments' && (
        <Card
          title="Scheduled Assessments"
          extra={
            <Button size="sm" onClick={handleOpenCreateModal} className="gap-1">
              <Plus size={16} /> Create Assessment
            </Button>
          }
          bodyClassName="p-0"
        >
          {assessments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No assessments created. Start by creating one.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Active Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {assessments.map((test) => (
                    <tr key={test._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{test.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{test.subject?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold uppercase text-slate-400">{test.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(test._id, test.isActive)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-micro ${test.isActive ? 'bg-emerald-50 text-accent-success hover:bg-emerald-100' : 'bg-red-50 text-accent-danger hover:bg-red-100'
                            }`}
                        >
                          {test.isActive ? 'Published' : 'Archived'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs flex gap-2 items-center">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditDetailsModal(test)}>
                          Edit Details
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => handleOpenQuestionsModal(test)}>
                          Edit Questions
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate('/leaderboard')}>
                          View Rankings
                        </Button>
                        <button
                          onClick={() => handleDeleteAssessment(test._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-accent-danger hover:bg-red-50 transition-colors"
                          title="Delete Assessment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Question Bank Dashboard */}
      {activeTab === 'add_question' && (
        <Card
          title="Question Bank"
          extra={
            <Button size="sm" onClick={() => setShowQuestionModal(true)} className="gap-1">
              <Plus size={16} /> Add New Question
            </Button>
          }
          bodyClassName="p-0"
        >
          {questions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No questions in the bank. Add a question.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Question/Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {questions.slice(0, visibleCount).map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 max-w-sm truncate">
                        {q.question || q.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{q.subject?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-600">{q.marks || q.maxMarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs capitalize text-slate-400">{q.difficulty || 'theory'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <button
                          onClick={() => {
                            if (!window.confirm('Are you sure you want to delete this question from the bank? This will NOT remove it from any existing assessments that copy it, but it will be removed from the bank.')) return;
                            api.delete(`/questions/${q.type || 'mcq'}/${q._id}`)
                              .then(() => fetchDashboardData())
                              .catch(err => alert(err.message || 'Deletion failed'));
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-accent-danger hover:bg-red-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                >
                  View More Questions
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Submissions Review */}
      {activeTab === 'grade' && (
        <Card title="Submitted Assessments Needing Review" bodyClassName="p-0">
          {attemptsToGrade.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No submissions require manual grading.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Assessment</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {attemptsToGrade.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{att.student?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{att.assessment?.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(att.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <Button size="sm" onClick={() => handleOpenGradeReview(att)}>
                          Review & Grade
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Mock Assessments Dashboard */}
      {activeTab === 'mocks' && (
        <Card title="Practice Mock Assessments" bodyClassName="p-0">
          {mockAssessments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No mock assessments loaded.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Duration (mins)</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Questions Count</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {mockAssessments.map((mock) => (
                    <tr key={mock._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{mock.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold uppercase text-slate-400">{mock.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{mock.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{mock.questions?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenMockEdit(mock)}>
                          Edit Details
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => handleOpenQuestionsModal(mock)}>
                          Edit Questions
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Modals definitions */}
      {/* Create Assessment Modal */}
      <Modal isOpen={showAssessmentModal} onClose={() => setShowAssessmentModal(false)} title={editingAssessmentId ? "Edit Assessment Details" : "Create New Assessment"}>
        <form onSubmit={handleAssessmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assessment Title</label>
            <input
              type="text"
              required
              value={assessmentForm.title}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Mid-Term Coding Exam"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject mapping</label>
              <select
                required
                value={assessmentForm.subject}
                onChange={(e) => setAssessmentForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="">Choose Subject</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assessment Type</label>
              <select
                value={assessmentForm.type}
                onChange={(e) => setAssessmentForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="mcq">MCQ Quiz</option>
                <option value="coding">Coding Sandbox</option>
                <option value="theory">Theory Paper</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (min)</label>
              <input
                type="number"
                required
                value={assessmentForm.duration}
                onChange={(e) => setAssessmentForm((p) => ({ ...p, duration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Passing Score</label>
              <input
                type="number"
                required
                value={assessmentForm.passingScore}
                onChange={(e) => setAssessmentForm((p) => ({ ...p, passingScore: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Marks</label>
              <input
                type="number"
                required
                value={assessmentForm.totalMarks}
                onChange={(e) => setAssessmentForm((p) => ({ ...p, totalMarks: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
            <input
              type="datetime-local"
              required
              value={assessmentForm.dueDate}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>

          <Button type="submit" className="w-full">
            Save Assessment
          </Button>
        </form>
      </Modal>

      {/* Add Question Modal */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title="Add Question to Bank">
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="mcq">MCQ Question</option>
            <option value="coding">Coding Question</option>
            <option value="theory">Theory Question</option>
          </select>
        </div>

        {/* Dynamic Forms based on Question Type */}
        {questionType === 'mcq' && (
          <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question Text</label>
              <textarea
                required
                value={mcqForm.question}
                onChange={(e) => setMcqForm((p) => ({ ...p, question: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {mcqForm.options.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-semibold text-slate-400 mb-0.5">Option {idx + 1}</label>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...mcqForm.options];
                      newOpts[idx] = e.target.value;
                      setMcqForm((p) => ({ ...p, options: newOpts }));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correct Option index</label>
                <select
                  value={mcqForm.correctAnswerIndex}
                  onChange={(e) => setMcqForm((p) => ({ ...p, correctAnswerIndex: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject mapping</label>
                <select
                  required
                  value={mcqForm.subject}
                  onChange={(e) => setMcqForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Choose Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMcqForm((p) => ({ ...p, difficulty: 'easy', negativeMarks: 0 }))}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${mcqForm.difficulty === 'easy'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setMcqForm((p) => ({ ...p, difficulty: 'moderate', negativeMarks: 0.25 }))}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${mcqForm.difficulty === 'moderate'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => setMcqForm((p) => ({ ...p, difficulty: 'difficult', negativeMarks: 0.5 }))}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${mcqForm.difficulty === 'difficult'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Difficult
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Negative Marks penalty</label>
                <input
                  type="number"
                  step="0.25"
                  value={mcqForm.negativeMarks}
                  disabled={mcqForm.difficulty === 'easy'}
                  onChange={(e) => setMcqForm((p) => ({ ...p, negativeMarks: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white disabled:opacity-55"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Save MCQ Question</Button>
          </form>
        )}

        {questionType === 'coding' && (
          <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Problem Title</label>
              <input
                type="text"
                required
                value={codingForm.title}
                onChange={(e) => setCodingForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <textarea
                required
                value={codingForm.description}
                onChange={(e) => setCodingForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Markdown problem specification..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sample Input</label>
                <input
                  type="text"
                  value={codingForm.sampleInput}
                  onChange={(e) => setCodingForm((p) => ({ ...p, sampleInput: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sample Output</label>
                <input
                  type="text"
                  value={codingForm.sampleOutput}
                  onChange={(e) => setCodingForm((p) => ({ ...p, sampleOutput: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                />
              </div>
            </div>

            {/* Test Case Inputs */}
            <div className="bg-slate-50 p-3 rounded-lg space-y-2">
              <span className="text-xs font-bold text-slate-400">Execution Test Cases</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Test 1 Input"
                  value={codingForm.input1}
                  onChange={(e) => setCodingForm((p) => ({ ...p, input1: e.target.value }))}
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Test 1 Expected Out"
                  value={codingForm.output1}
                  onChange={(e) => setCodingForm((p) => ({ ...p, output1: e.target.value }))}
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject mapping</label>
                <select
                  required
                  value={codingForm.subject}
                  onChange={(e) => setCodingForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Choose Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCodingForm((p) => ({ ...p, difficulty: 'easy' }))}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${codingForm.difficulty === 'easy'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodingForm((p) => ({ ...p, difficulty: 'moderate' }))}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${codingForm.difficulty === 'moderate'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodingForm((p) => ({ ...p, difficulty: 'difficult' }))}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${codingForm.difficulty === 'difficult'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                      }`}
                  >
                    Difficult
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">Save Coding Question</Button>
          </form>
        )}

        {questionType === 'theory' && (
          <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question Description</label>
              <textarea
                required
                value={theoryForm.question}
                onChange={(e) => setTheoryForm((p) => ({ ...p, question: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject mapping</label>
                <select
                  required
                  value={theoryForm.subject}
                  onChange={(e) => setTheoryForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Choose Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Maximum Marks</label>
                <input
                  type="number"
                  value={theoryForm.maxMarks}
                  onChange={(e) => setTheoryForm((p) => ({ ...p, maxMarks: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Suggested Solution (Optional)</label>
              <textarea
                value={theoryForm.suggestedAnswer}
                onChange={(e) => setTheoryForm((p) => ({ ...p, suggestedAnswer: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>

            <Button type="submit" className="w-full">Save Theory Question</Button>
          </form>
        )}
      </Modal>

      {/* Manual Grading Review Modal */}
      <Modal isOpen={showGradeModal} onClose={() => setShowGradeModal(false)} title="Grade Theory Attempt">
        {activeAttempt && (
          <form onSubmit={handleGradingSubmit} className="space-y-4">
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Student Response Info</span>
              <p className="font-bold text-slate-800 text-sm mt-1">{activeAttempt.student?.name}</p>
              <p className="text-xs text-slate-500">Exam: {activeAttempt.assessment?.title}</p>
            </div>

            {/* Answer Loops */}
            {theoryGrades.map((gradeItem, idx) => (
              <div key={idx} className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-700">Answer Block #{idx + 1}</span>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed max-h-40 overflow-y-auto">
                  {gradeItem.submittedText || <span className="italic text-slate-400">Empty response.</span>}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Award Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={gradeItem.marksObtained}
                      onChange={(e) => {
                        const newGrades = [...theoryGrades];
                        newGrades[idx].marksObtained = parseFloat(e.target.value);
                        setTheoryGrades(newGrades);
                      }}
                      className="w-full px-2 py-1.5 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Feedback Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Well written..."
                      value={gradeItem.feedback}
                      onChange={(e) => {
                        const newGrades = [...theoryGrades];
                        newGrades[idx].feedback = e.target.value;
                        setTheoryGrades(newGrades);
                      }}
                      className="w-full px-2 py-1.5 border rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="submit" className="w-full">
              Publish Grade Results
            </Button>
          </form>
        )}
      </Modal>

      {/* Edit Mock Details Modal */}
      <Modal isOpen={showMockEditModal} onClose={() => setShowMockEditModal(false)} title={`Edit Details - ${selectedAssessment?.title}`}>
        <form onSubmit={handleMockEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (minutes)</label>
            <input
              type="number"
              required
              value={mockEditForm.duration}
              onChange={(e) => setMockEditForm(p => ({ ...p, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Passing Score</label>
            <input
              type="number"
              required
              value={mockEditForm.passingScore}
              onChange={(e) => setMockEditForm(p => ({ ...p, passingScore: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Marks</label>
            <input
              type="number"
              required
              value={mockEditForm.totalMarks}
              onChange={(e) => setMockEditForm(p => ({ ...p, totalMarks: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Details
          </Button>
        </form>
      </Modal>

      {/* Edit Assessment Questions Modal */}
      <Modal isOpen={showQuestionsModal} onClose={() => setShowQuestionsModal(false)} title={`Edit Questions - ${selectedAssessment?.title}`}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {/* Current questions in assessment */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Questions in Assessment ({selectedAssessment?.type?.toUpperCase()})</h4>
            {tempQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-dashed">No questions added yet.</p>
            ) : (
              <div className="space-y-2">
                {tempQuestions.map((q, idx) => {
                  const questionObj = q.questionId || {};
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg text-xs">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="font-semibold text-slate-700 block truncate">
                          {questionObj.question || questionObj.title || 'Untitled Question'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {q.questionModel} • {questionObj.marks || questionObj.maxMarks} marks
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionFromAssessment(questionObj._id || questionObj)}
                        className="text-red-500 hover:text-red-750 font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Add Questions from Bank */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add {selectedAssessment?.type?.toUpperCase()} Questions from Bank</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {questions
                .filter((q) => q.type === selectedAssessment?.type)
                .map((q) => (
                  <div key={q._id} className="flex items-center justify-between p-3 bg-white border rounded-lg text-xs hover:bg-slate-50/50">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="font-semibold text-slate-700 block truncate">
                        {q.question || q.title || 'Untitled Question'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {q.type} • {q.marks || q.maxMarks} marks • {q.subject?.name || 'No Subject'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToAssessment(q)}
                      className="text-brand-600 hover:text-brand-800 font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              {questions.filter((q) => q.type === selectedAssessment?.type).length === 0 && (
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-dashed">
                  No matching {selectedAssessment?.type?.toUpperCase()} questions found in bank.
                </p>
              )}
            </div>
          </div>

          <Button type="button" onClick={handleQuestionsSave} className="w-full mt-4">
            Save Question Assignments
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorDashboardView;
