import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';

const AssessmentBuilder = () => {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState({
    title: '',
    type: 'quiz',
    duration: 60,
    status: 'draft',
    max_score: 100,
    instructions: ''
  });
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const res = await assessmentApi.getById(assessmentId);
      setAssessment(res.data.data);
      const qRes = await assessmentApi.getQuestions(assessmentId);
      setQuestions(qRes.data.data || []);
    } catch (err) {
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    try {
      if (assessmentId) {
        await assessmentApi.update(assessmentId, assessment);
      } else {
        const res = await assessmentApi.create({ ...assessment, course_id: courseId });
        navigate(`/courses/${courseId}/assessments/${res.data.data.id}/edit`);
      }
    } catch (err) {
      setError('Failed to save assessment');
    }
  };

  const [newQuestion, setNewQuestion] = useState({ type: 'mcq', content: '', marks: 1, order: questions.length + 1 });
  const [newOptions, setNewOptions] = useState([{ text: '', is_correct: false }]);

  const handleAddQuestion = async () => {
    try {
      await assessmentApi.createQuestion(assessmentId, {
        ...newQuestion,
        options: newQuestion.type === 'mcq' ? newOptions : []
      });
      loadAssessment(); // reload
      setNewQuestion({ type: 'mcq', content: '', marks: 1, order: questions.length + 2 });
      setNewOptions([{ text: '', is_correct: false }]);
    } catch (err) {
      setError('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    try {
      await assessmentApi.deleteQuestion(qId, assessmentId);
      loadAssessment();
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleGenerateQuestion = async () => {
    if (!aiTopic.trim()) return;
    try {
      setIsGenerating(true);
      setError(null);
      
      const { default: api } = await import('../../services/api');
      const res = await api.post('/ai/chat', {
        message: aiTopic,
        agentType: 'question_generator'
      });
      
      // Parse JSON
      let generated;
      try {
        generated = JSON.parse(res.data.data.response);
      } catch (e) {
        throw new Error('AI returned invalid format.');
      }
      
      if (generated.type === 'multiple_choice' || generated.type === 'true_false') {
        const generatedOptions = generated.options.map((opt, i) => ({
          text: opt,
          is_correct: i === generated.correct_option_index
        }));
        
        await assessmentApi.createQuestion(assessmentId, {
          type: 'mcq',
          content: generated.text,
          marks: generated.points || 1,
          order: questions.length + 1,
          options: generatedOptions
        });
        
        loadAssessment();
        setAiTopic('');
      } else {
        throw new Error('Unsupported question type generated.');
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate question with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading builder...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{assessmentId ? 'Edit' : 'Create'} Assessment</h1>
        <button onClick={() => navigate(`/courses/${courseId}`)} className="text-gray-600 hover:text-gray-900">
          Back to Course
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {/* Assessment Meta */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-xl font-semibold">Assessment Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              value={assessment.title}
              onChange={e => setAssessment({...assessment, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              value={assessment.type}
              onChange={e => setAssessment({...assessment, type: e.target.value})}
            >
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              value={assessment.duration}
              onChange={e => setAssessment({...assessment, duration: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              value={assessment.status}
              onChange={e => setAssessment({...assessment, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <button onClick={handleSaveAssessment} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Save Assessment Details
        </button>
      </div>

      {/* Questions Section */}
      {assessmentId && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
          
          {/* List Existing Questions */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium uppercase">{q.type}</span>
                    <span className="text-gray-500 text-sm">{q.marks} Marks</span>
                  </div>
                  <p className="text-gray-900">{q.content}</p>
                  {q.type === 'mcq' && (
                    <ul className="mt-4 space-y-2">
                      {q.question_options?.map(opt => (
                        <li key={opt.id} className={`text-sm px-3 py-2 rounded ${opt.is_correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700'}`}>
                          {opt.text} {opt.is_correct && '(Correct)'}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
              </div>
            ))}
          </div>

          {/* Add New Question */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Question</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg"
                  value={newQuestion.type}
                  onChange={e => setNewQuestion({...newQuestion, type: e.target.value})}
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="theory">Theory</option>
                  <option value="coding">Coding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg"
                  value={newQuestion.marks}
                  onChange={e => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Content</label>
              <textarea 
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg h-24"
                value={newQuestion.content}
                onChange={e => setNewQuestion({...newQuestion, content: e.target.value})}
              />
            </div>

            {newQuestion.type === 'mcq' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {newOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="radio" checked={opt.is_correct} onChange={() => {
                      const updated = newOptions.map((o, idx) => ({...o, is_correct: idx === i}));
                      setNewOptions(updated);
                    }} />
                    <input 
                      type="text" 
                      placeholder={`Option ${i+1}`}
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                      value={opt.text}
                      onChange={e => {
                        const updated = [...newOptions];
                        updated[i].text = e.target.value;
                        setNewOptions(updated);
                      }}
                    />
                  </div>
                ))}
                <button onClick={() => setNewOptions([...newOptions, {text:'', is_correct:false}])} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  + Add Option
                </button>
              </div>
            )}

            <div className="flex justify-between items-end gap-4 border-t border-gray-200 pt-4 mt-4">
              <button onClick={handleAddQuestion} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Add Question Manually
              </button>
              
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="Topic (e.g. Mitochondria)" 
                  className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                />
                <button 
                  onClick={handleGenerateQuestion} 
                  disabled={isGenerating || !aiTopic.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentBuilder;
