import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTimer } from '../hooks/useTimer';
import { assessmentApi } from '../api/assessmentApi';
import apiClient from '../api/client';
import Editor from '@monaco-editor/react';
import Button from '../components/common/Button';
import { AlertTriangle, ShieldCheck, Clock, List, ChevronLeft, ChevronRight, Play, Eye, CheckCircle2, XCircle } from 'lucide-react';

const ActiveAssessment = () => {
  const { id } = useParams(); // This is the submission ID
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ question_id, answer_text, code_answer, selected_option_id }]
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Hardcoded code language for now, would be nice to have language choice
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showPreview, setShowPreview] = useState(false);

  const [initialDuration, setInitialDuration] = useState(0);

  useEffect(() => {
    const fetchExamState = async () => {
      setLoading(true);
      try {
        // Fetch submission details directly from API endpoint using base client since we didn't expose GET /submissions/:id in assessmentApi yet, oh wait we didn't make a GET /submissions/:id endpoint! 
        // Let's assume we can get it or we need to add it.
        // Actually, we didn't add a GET /submissions/:id endpoint for students!
        // We will need to quickly add it in the backend or fetch via another route.
        // Let's assume we add it quickly in the controller or we can use another way.
        // Wait, I will use apiClient directly if needed.
        const res = await apiClient.get(`/submissions/assessment/${id}`); 
        // Wait, `/submissions/assessment/:assessmentId` gets ALL submissions for teacher.
        // We need the student's submission.
        // Let's fetch it from another custom route or we will have to modify backend.
        
        // Actually, we can fetch the assessment first... but we only have submissionId in URL.
        // This is a missing endpoint. I will update the backend `submissionController.js` and `submissionRoutes.js` shortly.
        
        const subRes = await apiClient.get(`/submissions/${id}`);
        const submissionData = subRes.data.data;
        
        const assessRes = await assessmentApi.getById(submissionData.assessment_id);
        const qRes = await assessmentApi.getQuestions(submissionData.assessment_id);
        
        setSubmission(submissionData);
        setAssessment(assessRes.data.data);
        setQuestions(qRes.data.data || []);
        
        // Map existing answers
        const mappedAnswers = (qRes.data.data || []).map(q => {
          const existingAns = submissionData.submission_answers?.find(a => a.question_id === q.id);
          return {
            question_id: q.id,
            answer_text: existingAns?.answer_text || '',
            code_answer: existingAns?.code_answer || '',
            selected_option_id: existingAns?.selected_option_id || null,
            marks_awarded: existingAns?.marks_awarded || 0,
            feedback: existingAns?.feedback || ''
          };
        });
        setAnswers(mappedAnswers);

        if (submissionData.status === 'in_progress') {
          const elapsed = Math.floor((Date.now() - new Date(submissionData.created_at).getTime()) / 1000);
          const totalSeconds = assessRes.data.data.duration * 60;
          setInitialDuration(Math.max(0, totalSeconds - elapsed));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load examination session.');
      } finally {
        setLoading(false);
      }
    };
    fetchExamState();
  }, [id]);

  const isExamActive = submission?.status === 'in_progress';

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await assessmentApi.submitFinal(id, answers);
      alert('Assessment submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const { formatTime, timeLeft } = useTimer(
    isExamActive ? initialDuration : 0,
    isExamActive ? handleFinalSubmit : () => {}
  );

  useEffect(() => {
    if (loading || !submission || timeLeft <= 0 || !isExamActive) return;
    
    const triggerAutosave = async () => {
      setSaving(true);
      try {
        await assessmentApi.saveAnswers(id, answers);
      } catch (err) {
        console.warn('Auto-save failed');
      } finally {
        setSaving(false);
      }
    };

    const intervalId = setInterval(triggerAutosave, 30000);
    return () => clearInterval(intervalId);
  }, [answers, submission, id, loading, timeLeft, isExamActive]);

  const handleUpdateAnswer = (field, value) => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex ? { ...ans, [field]: value } : ans
      )
    );
  };

  const insertFormat = (tagOpen, tagClose = '') => {
    const textarea = document.getElementById('theory-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + selected + tagClose;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    handleUpdateAnswer('answer_text', newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
    }, 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 gap-2">
        <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
        Loading test workspace...
      </div>
    );
  }

  if (error || !submission || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center p-6 border rounded bg-white shadow-sm max-w-sm">
          <AlertTriangle className="text-accent-danger mx-auto mb-3" size={32} />
          <p>{error || 'Attempt could not be initialized.'}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const theoryText = currentAnswer?.answer_text || '';
  const wordCount = theoryText.trim() === '' ? 0 : theoryText.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <nav className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isExamActive ? 'Active Exam Session' : 'Exam Review Workspace'}
          </span>
          <h2 className="font-extrabold text-slate-800 text-base">{assessment.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {isExamActive ? (
            <>
              {saving && <span className="text-xs text-slate-400 animate-pulse">Autosaving answers...</span>}
              <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-100 font-mono font-bold text-sm">
                <Clock size={16} className="animate-spin" /> {formatTime()}
              </div>
              <Button onClick={() => assessmentApi.saveAnswers(id, answers)} variant="secondary" size="sm" className="mr-2">
                Save Draft
              </Button>
              <Button variant="danger" size="sm" onClick={handleFinalSubmit} disabled={submitting}>
                Finish Exam
              </Button>
            </>
          ) : (
            <>
              <span className="px-3 py-1.5 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg font-bold text-xs">
                Marks: {submission.score} / {assessment.max_score} ({submission.status})
              </span>
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-130px)]">
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <List size={16} /> Question Navigator
            </span>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[idx];
                let btnClass = '';
                if (currentIndex === idx) {
                  btnClass = 'bg-brand-500 text-white border-brand-500 shadow-sm';
                } else if (!isExamActive) {
                  if (ans?.marks_awarded > 0) {
                    btnClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                  } else if (ans?.marks_awarded === 0 && submission.status === 'evaluated') {
                    btnClass = 'bg-red-50 text-red-500 border-red-200';
                  } else {
                    btnClass = 'bg-slate-50 text-slate-400 border-slate-200/60';
                  }
                } else {
                  const isAnswered = ans?.selected_option_id || (ans?.code_answer && ans.code_answer.trim() !== '') || (ans?.answer_text && ans.answer_text.trim() !== '');
                  btnClass = isAnswered
                    ? 'bg-emerald-50 text-accent-success border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setShowPreview(false); }}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-micro border ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-lg text-[10px] text-slate-400 leading-normal flex items-start gap-2">
            <ShieldCheck size={16} className="text-brand-500 shrink-0 mt-0.5" />
            <span>Secure exam active.</span>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
          <div className="space-y-6">
            {!isExamActive && (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                (currentAnswer?.marks_awarded || 0) > 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold">
                  {(currentAnswer?.marks_awarded || 0) > 0 ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      Correct / Partially Correct Submission
                    </>
                  ) : (
                    <>
                      <XCircle size={18} className="text-red-500" />
                      Incorrect or Zero-Marks Submission
                    </>
                  )}
                </div>
                <span className="text-sm font-black">
                  Marks Awarded: {currentAnswer?.marks_awarded || 0} / {activeQuestion?.marks || 0}
                </span>
              </div>
            )}

            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <span className="inline-block text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase mb-4">
                Question {currentIndex + 1} of {questions.length} — {activeQuestion?.marks} Marks
              </span>

              {activeQuestion?.type === 'mcq' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                    {activeQuestion?.content}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 mt-6">
                    {activeQuestion?.question_options?.map((opt, oIdx) => {
                      const isSelected = currentAnswer?.selected_option_id === opt.id;
                      const isCorrect = !isExamActive && opt.is_correct;

                      let btnStyle = 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700';
                      
                      if (!isExamActive) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-50 border-red-400 text-red-800 ring-1 ring-red-400';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-brand-50 border-brand-500 text-brand-800 ring-1 ring-brand-500';
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={!isExamActive}
                          onClick={() => handleUpdateAnswer('selected_option_id', opt.id)}
                          className={`p-4 border rounded-xl text-left text-xs font-semibold transition-micro flex items-center justify-between ${btnStyle}`}
                        >
                          <div className="flex items-center">
                            <span className="inline-block w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold text-center leading-5 mr-3">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            {opt.text}
                          </div>
                          {!isExamActive && (
                            <div className="text-[10px] font-bold uppercase">
                              {isCorrect && <span className="text-emerald-600">Correct Answer</span>}
                              {isSelected && !isCorrect && <span className="text-red-500">Your Selection</span>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeQuestion?.type === 'coding' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800">{activeQuestion?.content}</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                    <div className="px-4 py-2.5 bg-slate-50 border-b flex items-center justify-between">
                      <select
                        value={codeLanguage}
                        disabled={!isExamActive}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="px-2 py-1 border rounded text-xs bg-white"
                      >
                        <option value="javascript">JavaScript (NodeJS)</option>
                        <option value="python">Python</option>
                      </select>
                      <span className="text-[10px] font-bold text-slate-400">MONACO INTERACTIVE EDITOR</span>
                    </div>
                    <Editor
                      height="300px"
                      language={codeLanguage}
                      theme="light"
                      value={currentAnswer?.code_answer || ''}
                      onChange={(val) => handleUpdateAnswer('code_answer', val)}
                      options={{ minimap: { enabled: false }, fontSize: 12, readOnly: !isExamActive }}
                    />
                  </div>
                  {!isExamActive && (
                    <div className="p-4 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-xl mt-4">
                      <span className="text-[10px] font-bold text-amber-600 block mb-1 uppercase">Instructor Feedback</span>
                      <p className="text-xs italic leading-relaxed">{currentAnswer?.feedback || 'Pending evaluation.'}</p>
                    </div>
                  )}
                </div>
              )}

              {activeQuestion?.type === 'theory' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                    {activeQuestion?.content}
                  </h3>
                  {isExamActive ? (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-b-0 border-slate-200 rounded-t-xl text-slate-500">
                        <button type="button" onClick={() => insertFormat('**', '**')} className="p-1 px-2 hover:bg-slate-200 rounded text-xs font-black">B</button>
                        <button type="button" onClick={() => insertFormat('*', '*')} className="p-1 px-2 hover:bg-slate-200 rounded text-xs italic">I</button>
                        <button type="button" onClick={() => insertFormat('\n```\n', '\n```\n')} className="p-1 px-2 hover:bg-slate-200 rounded text-xs font-mono">&lt;/&gt;</button>
                        <button type="button" onClick={() => insertFormat('\n- ')} className="p-1 px-2 hover:bg-slate-200 rounded text-xs">• List</button>
                        <div className="h-4 w-px bg-slate-200 mx-2"></div>
                        <button type="button" onClick={() => setShowPreview(!showPreview)} className={`p-1 px-2 rounded text-xs font-bold flex items-center gap-1 transition-colors ${showPreview ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-200'}`}>
                          <Eye size={12} /> {showPreview ? 'Edit Editor' : 'Live Preview'}
                        </button>
                      </div>

                      {showPreview ? (
                        <div className="w-full h-64 p-4 border border-slate-200 rounded-b-xl text-xs bg-slate-50 overflow-y-auto whitespace-pre-wrap font-sans">
                          {theoryText || <span className="italic text-slate-400">Response is empty. Type in edit tab to preview.</span>}
                        </div>
                      ) : (
                        <textarea
                          id="theory-textarea"
                          value={theoryText}
                          onChange={(e) => handleUpdateAnswer('answer_text', e.target.value)}
                          placeholder="Write your response... Markdown formatting is supported."
                          className="w-full h-64 p-4 border border-slate-200 rounded-b-xl text-xs bg-white focus:ring-brand-500"
                        />
                      )}

                      <div className="flex items-center justify-end gap-4 text-[10px] text-slate-400 mt-2 font-medium">
                        <span>{theoryText.length} Characters</span>
                        <span>{wordCount} Words</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-6">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Your Answer</span>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap font-sans">{theoryText || '— No Answer Submitted —'}</p>
                      </div>
                      <div className="p-4 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-xl">
                        <span className="text-[10px] font-bold text-amber-600 block mb-1 uppercase">Instructor Feedback</span>
                        <p className="text-xs italic leading-relaxed">{currentAnswer?.feedback || 'Pending evaluation.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" disabled={currentIndex === 0} onClick={() => { setCurrentIndex(idx => idx - 1); setShowPreview(false); }} className="gap-1.5">
              <ChevronLeft size={16} /> Previous
            </Button>
            <span className="text-xs text-slate-400 font-semibold">Question {currentIndex + 1} / {questions.length}</span>
            {currentIndex === questions.length - 1 ? (
              isExamActive ? (
                <Button variant="primary" onClick={handleFinalSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 font-bold">
                  Submit Exam <ShieldCheck size={16} />
                </Button>
              ) : (
                <Button variant="outline" disabled className="gap-1.5">Next <ChevronRight size={16} /></Button>
              )
            ) : (
              <Button variant="outline" onClick={() => { setCurrentIndex(idx => idx + 1); setShowPreview(false); }} className="gap-1.5">
                Next <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActiveAssessment;
