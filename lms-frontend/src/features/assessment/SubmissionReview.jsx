import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';

const SubmissionReview = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingUpdates, setGradingUpdates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const loadData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([
        assessmentApi.getById(assessmentId),
        assessmentApi.getSubmissions(assessmentId)
      ]);
      setAssessment(aRes.data.data);
      setSubmissions(sRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (sub) => {
    setSelectedSubmission(sub);
    // Initialize grading state
    const initialGrading = {};
    sub.submission_answers.forEach(ans => {
      initialGrading[ans.question_id] = {
        marks_awarded: ans.marks_awarded || 0,
        feedback: ans.feedback || ''
      };
    });
    setGradingUpdates(initialGrading);
  };

  const handleSaveGrades = async () => {
    try {
      const updates = Object.keys(gradingUpdates).map(qId => ({
        question_id: qId,
        marks_awarded: gradingUpdates[qId].marks_awarded,
        feedback: gradingUpdates[qId].feedback
      }));

      await assessmentApi.gradeSubmission(selectedSubmission.id, updates);
      setSelectedSubmission(null);
      loadData(); // reload list
    } catch (err) {
      console.error("Failed to save grades", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading submissions...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 flex gap-8">
      {/* List */}
      <div className="w-1/3 border-r border-gray-100 pr-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-gray-500 text-sm">No submissions yet.</p>
        ) : (
          submissions.map(sub => (
            <div 
              key={sub.id} 
              onClick={() => handleSelect(sub)}
              className={`p-4 rounded-xl cursor-pointer border transition-colors ${selectedSubmission?.id === sub.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}`}
            >
              <h3 className="font-semibold text-gray-900">{sub.users?.full_name || 'Student'}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${sub.status === 'evaluated' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {sub.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">Score: {sub.score} / {assessment?.max_score}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail */}
      <div className="w-2/3">
        {selectedSubmission ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reviewing: {selectedSubmission.users?.full_name}</h2>
                <p className="text-gray-500 mt-1">Submitted at: {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
              </div>
              <button onClick={handleSaveGrades} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Save Grades
              </button>
            </div>

            <div className="space-y-8">
              {selectedSubmission.submission_answers.map((ans, idx) => (
                <div key={ans.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Question ID: {ans.question_id}</h4>
                  
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Student Answer:</p>
                    {ans.answer_text && <p className="text-gray-900 bg-white p-3 rounded border border-gray-200">{ans.answer_text}</p>}
                    {ans.code_answer && <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{ans.code_answer}</pre>}
                    {ans.selected_option_id && <p className="text-gray-900">Selected Option ID: {ans.selected_option_id}</p>}
                    {(!ans.answer_text && !ans.code_answer && !ans.selected_option_id) && <span className="text-gray-400 italic">No answer provided</span>}
                  </div>

                  <div className="grid grid-cols-4 gap-4 border-t border-gray-200 pt-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marks Awarded</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                        value={gradingUpdates[ans.question_id]?.marks_awarded || 0}
                        onChange={e => setGradingUpdates(prev => ({
                          ...prev, 
                          [ans.question_id]: { ...prev[ans.question_id], marks_awarded: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                        value={gradingUpdates[ans.question_id]?.feedback || ''}
                        onChange={e => setGradingUpdates(prev => ({
                          ...prev, 
                          [ans.question_id]: { ...prev[ans.question_id], feedback: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            Select a submission to review
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionReview;
