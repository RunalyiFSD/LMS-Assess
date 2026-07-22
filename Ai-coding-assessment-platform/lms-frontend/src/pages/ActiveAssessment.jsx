import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTimer } from '../hooks/useTimer';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Save, AlertTriangle, ShieldCheck, Clock, List, ChevronLeft, ChevronRight, Play, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';

const ActiveAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');

  // Sandbox runtime execution and preview states
  const [runningCode, setRunningCode] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [initialDuration, setInitialDuration] = useState(0);

  // Load attempt and assessment questions
  useEffect(() => {
    const fetchExamState = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/attempts/${id}`);
        if (res.data?.status === 'success') {
          const attemptData = res.data.data.attempt;
          setAttempt(attemptData);
          setAssessment(attemptData.assessment);
          setAnswers(attemptData.answers || []);

          if (attemptData.status === 'started' && attemptData.assessment) {
            const elapsed = Math.floor((Date.now() - new Date(attemptData.startedAt).getTime()) / 1000);
            const totalSeconds = attemptData.assessment.duration * 60;
            setInitialDuration(Math.max(0, totalSeconds - elapsed));
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load examination session.');
      } finally {
        setLoading(false);
      }
    };
    fetchExamState();
  }, [id]);

  // Submit assessment logic
  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/attempts/${id}/submit`, { answers });
      if (res.data?.status === 'success') {
        alert('Assessment submitted successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const isExamActive = attempt?.status === 'started';

  const { formatTime, timeLeft } = useTimer(
    isExamActive ? initialDuration : 0,
    isExamActive ? handleFinalSubmit : () => {}
  );

  // Heartbeat Auto-save every 30 seconds (Only when exam is active)
  useEffect(() => {
    if (loading || !attempt || timeLeft <= 0 || !isExamActive) return;

    const triggerAutosave = async () => {
      setSaving(true);
      try {
        await api.put(`/attempts/${id}/auto-save`, { answers });
      } catch (err) {
        console.warn('Auto-save heartbeat failed');
      } finally {
        setSaving(false);
      }
    };

    const intervalId = setInterval(triggerAutosave, 30000);
    return () => clearInterval(intervalId);
  }, [answers, attempt, id, loading, timeLeft, isExamActive]);

  // Run Student Code against public Sample Test cases
  const handleRunCode = async () => {
    if (runningCode || !activeQuestion) return;
    setRunningCode(true);
    setRunResult(null);
    try {
      const res = await api.post(`/attempts/${id}/run-code`, {
        questionId: activeQuestion._id,
        submittedCode: currentAnswer?.submittedCode || '',
        language: codeLanguage,
      });
      if (res.data?.status === 'success') {
        setRunResult(res.data.data.result);
      }
    } catch (err) {
      setRunResult({
        executionLogs: `Execution Failure: ${err.message}`,
      });
    } finally {
      setRunningCode(false);
    }
  };

  // Theory rich-text helper toolbar inserts style tags
  const insertFormat = (tagOpen, tagClose = '') => {
    const textarea = document.getElementById('theory-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + selected + tagClose;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    handleUpdateAnswer('submittedText', newValue);

    // Re-focus and position caret
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
    }, 10);
  };

  // Update answers state helper
  const handleUpdateAnswer = (field, value) => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex ? { ...ans, [field]: value } : ans
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 gap-2">
        <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
        Loading test workspace...
      </div>
    );
  }

  if (error || !attempt || !assessment) {
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

  const activeQuestionRef = assessment.questions[currentIndex];
  const activeQuestion = activeQuestionRef?.questionId;
  const currentAnswer = answers[currentIndex];

  // Helper properties for character/word counting (Theory questions only)
  const theoryText = currentAnswer?.submittedText || '';
  const wordCount = theoryText.trim() === '' ? 0 : theoryText.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Locked Navbar displaying test name and status */}
      <nav className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isExamActive ? 'Active Exam Session' : 'Exam Review Workspace'}
          </span>
          <h2 className="font-extrabold text-slate-800 text-base">{assessment.title}</h2>
        </div>

        {/* Live Timer or Score Summary */}
        <div className="flex items-center gap-4">
          {isExamActive ? (
            <>
              {saving && <span className="text-xs text-slate-400 animate-pulse">Autosaving answers...</span>}
              <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-100 font-mono font-bold text-sm">
                <Clock size={16} className="animate-spin" /> {formatTime()}
              </div>
              <Button variant="danger" size="sm" onClick={handleFinalSubmit} disabled={submitting}>
                Finish Exam
              </Button>
            </>
          ) : (
            <>
              <span className="px-3 py-1.5 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg font-bold text-xs">
                Marks: {attempt.totalMarksObtained} / {assessment.totalMarks} ({attempt.status})
              </span>
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Grid container layout */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-130px)]">
        {/* Navigation Sidebar panel */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <List size={16} /> Question Navigator
            </span>
            <div className="grid grid-cols-4 gap-2">
              {assessment.questions.map((q, idx) => {
                const ans = answers[idx];

                let btnClass = '';
                if (currentIndex === idx) {
                  btnClass = 'bg-brand-500 text-white border-brand-500 shadow-sm';
                } else if (!isExamActive) {
                  // Review Mode indicator styles
                  if (ans?.marksObtained > 0) {
                    btnClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                  } else if (ans?.marksObtained < 0 || (q.questionModel === 'MCQQuestion' && ans?.selectedOptionIndex !== null)) {
                    btnClass = 'bg-red-50 text-red-500 border-red-200';
                  } else {
                    btnClass = 'bg-slate-50 text-slate-400 border-slate-200/60';
                  }
                } else {
                  // Active test styles
                  const isAnswered =
                    (ans?.selectedOptionIndex !== null && ans?.selectedOptionIndex !== undefined) ||
                    (ans?.submittedCode && ans.submittedCode.trim() !== '') ||
                    (ans?.submittedText && ans.submittedText.trim() !== '');

                  btnClass = isAnswered
                    ? 'bg-emerald-50 text-accent-success border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setRunResult(null);
                      setShowPreview(false);
                    }}
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
            <span>Secure exam active. Standard browser navigation acts are locked.</span>
          </div>
        </aside>

        {/* Core Question Outlet */}
        <main className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
          <div className="space-y-6">
            {/* Review mode score display banner */}
            {!isExamActive && (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                (currentAnswer?.marksObtained || 0) > 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold">
                  {(currentAnswer?.marksObtained || 0) > 0 ? (
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
                  Marks Awarded: {currentAnswer?.marksObtained || 0} / {activeQuestion?.marks || activeQuestion?.maxMarks || 0}
                </span>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
              <span className="inline-block text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase mb-4">
                Question {currentIndex + 1} of {assessment.questions.length} — {activeQuestion?.marks || activeQuestion?.maxMarks} Marks
                {activeQuestion?.difficulty && ` — Difficulty: ${activeQuestion.difficulty}`}
              </span>

              {/* MCQ Question render */}
              {activeQuestionRef.questionModel === 'MCQQuestion' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                    {activeQuestion?.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3 mt-6">
                    {activeQuestion?.options.map((opt, oIdx) => {
                      const isSelected = currentAnswer?.selectedOptionIndex === oIdx;
                      const isCorrect = activeQuestion?.correctAnswerIndex === oIdx;

                      let btnStyle = 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700';
                      
                      if (!isExamActive) {
                        if (isCorrect) {
                          // Correct options show green in review
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold';
                        } else if (isSelected) {
                          // Selected wrong shows red in review
                          btnStyle = 'bg-red-50 border-red-400 text-red-800 ring-1 ring-red-400';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-brand-50 border-brand-500 text-brand-800 ring-1 ring-brand-500';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={!isExamActive}
                          onClick={() => handleUpdateAnswer('selectedOptionIndex', oIdx)}
                          className={`p-4 border rounded-xl text-left text-xs font-semibold transition-micro flex items-center justify-between ${btnStyle}`}
                        >
                          <div className="flex items-center">
                            <span className="inline-block w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold text-center leading-5 mr-3">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            {opt}
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

              {/* Coding Question Render */}
              {activeQuestionRef.questionModel === 'CodingQuestion' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800">{activeQuestion?.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg">
                    {activeQuestion?.description}
                  </p>

                  <div className="text-xs text-slate-400 space-y-1">
                    <span className="font-bold text-slate-500 block">Constraints</span>
                    <p className="italic">{activeQuestion?.constraints || 'No constraints defined.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded border">
                      <span className="font-semibold block text-slate-500 mb-1">Sample Input</span>
                      <pre className="font-mono">{activeQuestion?.sampleInput || 'N/A'}</pre>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border">
                      <span className="font-semibold block text-slate-500 mb-1">Sample Output</span>
                      <pre className="font-mono">{activeQuestion?.sampleOutput || 'N/A'}</pre>
                    </div>
                  </div>

                  {/* Code Editor Configuration */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                    <div className="px-4 py-2.5 bg-slate-50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <select
                          value={codeLanguage}
                          disabled={!isExamActive}
                          onChange={(e) => setCodeLanguage(e.target.value)}
                          className="px-2 py-1 border rounded text-xs bg-white"
                        >
                          <option value="javascript">JavaScript (NodeJS)</option>
                          <option value="python">Python</option>
                          <option value="cpp">C++ (g++)</option>
                          <option value="java">Java (JDK)</option>
                        </select>

                        {isExamActive && (
                          <Button
                            onClick={handleRunCode}
                            disabled={runningCode}
                            size="sm"
                            className="bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100 flex items-center gap-1.5"
                          >
                            <Play size={12} /> {runningCode ? 'Executing...' : 'Run Code'}
                          </Button>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">MONACO INTERACTIVE EDITOR</span>
                    </div>

                    <Editor
                      height="300px"
                      language={codeLanguage}
                      theme="light"
                      value={currentAnswer?.submittedCode || ''}
                      onChange={(val) => {
                        handleUpdateAnswer('submittedCode', val);
                        handleUpdateAnswer('language', codeLanguage);
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 12,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: !isExamActive,
                      }}
                    />
                  </div>

                  {/* Sandbox runtime logs and console window */}
                  {(runResult || (!isExamActive && currentAnswer?.executionLogs)) && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sandbox Console Log Output</label>
                      <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto border border-slate-800 shadow-inner">
                        {runResult 
                          ? runResult.executionLogs 
                          : currentAnswer?.executionLogs || 'No compilation/execution logs recorded.'}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Theory Question Render */}
              {activeQuestionRef.questionModel === 'TheoryQuestion' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                    {activeQuestion?.question}
                  </h3>

                  {isExamActive ? (
                    <div className="space-y-2 mt-4">
                      {/* Markdown helper buttons bar */}
                      <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-b-0 border-slate-200 rounded-t-xl text-slate-500">
                        <button
                          type="button"
                          onClick={() => insertFormat('**', '**')}
                          className="p-1 px-2 hover:bg-slate-200 rounded text-xs font-black"
                          title="Bold text"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormat('*', '*')}
                          className="p-1 px-2 hover:bg-slate-200 rounded text-xs italic"
                          title="Italic text"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormat('\n```\n', '\n```\n')}
                          className="p-1 px-2 hover:bg-slate-200 rounded text-xs font-mono"
                          title="Code Block"
                        >
                          &lt;/&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormat('\n- ')}
                          className="p-1 px-2 hover:bg-slate-200 rounded text-xs"
                          title="Bullet List"
                        >
                          • List
                        </button>
                        <div className="h-4 w-px bg-slate-200 mx-2"></div>
                        <button
                          type="button"
                          onClick={() => setShowPreview(!showPreview)}
                          className={`p-1 px-2 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                            showPreview ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-200'
                          }`}
                        >
                          <Eye size={12} /> {showPreview ? 'Edit Editor' : 'Live Preview'}
                        </button>
                      </div>

                      {showPreview ? (
                        <div className="w-full h-64 p-4 border border-slate-200 rounded-b-xl text-xs bg-slate-50 leading-relaxed overflow-y-auto whitespace-pre-wrap font-sans">
                          {theoryText || <span className="italic text-slate-400">Response is empty. Type in edit tab to preview.</span>}
                        </div>
                      ) : (
                        <textarea
                          id="theory-textarea"
                          value={theoryText}
                          onChange={(e) => handleUpdateAnswer('submittedText', e.target.value)}
                          placeholder="Write your response... Markdown formatting is supported."
                          className="w-full h-64 p-4 border border-slate-200 rounded-b-xl text-xs bg-white leading-relaxed focus:ring-brand-500"
                        />
                      )}

                      {/* Word and Character counters */}
                      <div className="flex items-center justify-end gap-4 text-[10px] text-slate-400 mt-2 font-medium">
                        <span>{theoryText.length} Characters</span>
                        <span>{wordCount} Words</span>
                      </div>
                    </div>
                  ) : (
                    // Review Mode details for Theory Question
                    <div className="space-y-4 mt-6">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Your Answer Submission</span>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{theoryText || '— No Answer Submitted —'}</p>
                        
                        <div className="flex justify-end text-[10px] text-slate-400 mt-4">
                          <span>{theoryText.length} Characters | {wordCount} Words</span>
                        </div>
                      </div>

                      {/* Instructor grading feedback box */}
                      <div className="p-4 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-xl">
                        <span className="text-[10px] font-bold text-amber-600 block mb-1 uppercase">Instructor Evaluation Feedback</span>
                        <p className="text-xs italic leading-relaxed">{currentAnswer?.feedback || 'Pending evaluation.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((idx) => idx - 1);
                setRunResult(null);
                setShowPreview(false);
              }}
              className="gap-1.5"
            >
              <ChevronLeft size={16} /> Previous
            </Button>

            <span className="text-xs text-slate-400 font-semibold">
              Question {currentIndex + 1} / {assessment.questions.length}
            </span>

            {currentIndex === assessment.questions.length - 1 ? (
              isExamActive ? (
                <Button
                  variant="primary"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 font-bold transition-all"
                >
                  Submit Exam <ShieldCheck size={16} />
                </Button>
              ) : (
                <Button variant="outline" disabled className="gap-1.5">
                  Next <ChevronRight size={16} />
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentIndex((idx) => idx + 1);
                  setRunResult(null);
                  setShowPreview(false);
                }}
                className="gap-1.5"
              >
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
