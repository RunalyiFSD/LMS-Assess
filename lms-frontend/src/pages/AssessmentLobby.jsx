import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import api from '../services/api';
import { ClipboardList, ShieldAlert, Clock, Award, Play, CheckCircle2 } from 'lucide-react';

const AssessmentLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/assessments/${id}`);
        if (res.data?.status === 'success') {
          setAssessment(res.data.data.assessment);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assessment specifications');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessmentDetails();
  }, [id]);

  const handleBeginAttempt = async () => {
    try {
      const res = await api.post(`/attempts/start/${id}`);
      if (res.data?.status === 'success') {
        const attemptId = res.data.data.attempt._id;
        navigate(`/assessment/${attemptId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to start attempt session');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12 text-slate-400 gap-2">
          <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          Preparing lobby specifications...
        </div>
      </Layout>
    );
  }

  if (error || !assessment) {
    return (
      <Layout>
        <div className="text-center py-10 text-slate-500">
          <p>{error || 'Assessment not found.'}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Lobby Details Header */}
        <div className="flex items-center gap-3">
          <ClipboardList className="text-brand-500" size={32} />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Assessment Lobby</h1>
            <p className="text-xs text-slate-500 mt-1">Review the guidelines and rules before starting.</p>
          </div>
        </div>

        <Card title={assessment.title} subtitle={`${assessment.subject?.name || ''} (${assessment.subject?.code || ''})`}>
          <div className="space-y-6">
            {/* Meta values */}
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duration</span>
                <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-1">
                  <Clock size={16} className="text-brand-500" /> {assessment.duration} mins
                </span>
              </div>
              <div className="text-center border-l border-r border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Questions</span>
                <span className="text-base font-bold text-slate-800 block mt-1">
                  {assessment.questions?.length} Items
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Passing Threshold</span>
                <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-1">
                  <Award size={16} className="text-emerald-500" /> {assessment.passingScore} marks
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Overview Description</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {assessment.description || 'No detailed instructions configured.'}
              </p>
            </div>

            {/* Warnings Rules */}
            <div className="bg-red-50/50 border border-red-200/60 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-accent-danger font-bold text-xs uppercase tracking-wider">
                <ShieldAlert size={16} /> Exam Code of Conduct
              </div>
              <ul className="list-disc list-inside text-xs text-slate-500 space-y-1.5 leading-relaxed">
                <li>Once you click "Start Assessment", the countdown timer begins and cannot be paused.</li>
                <li>Closing the browser tab will NOT pause your timer. You can log back in and resume the test.</li>
                <li>Auto-save operates every 30 seconds to lock your answers into the cloud.</li>
                <li>MCQs containing Difficult or Moderate tags have active negative marking configurations.</li>
                <li>When the timer reaches 00:00, the system locks and submits your answers automatically.</li>
              </ul>
            </div>

            {assessment.isCompleted ? (
              <div className="bg-emerald-50 border border-emerald-200/80 p-5 rounded-2xl text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span>Assessment Already Completed</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  You have already submitted your attempt for this assessment. Single-attempt rules are enforced and re-attempts are prohibited.
                </p>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="mt-2">
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <Button onClick={handleBeginAttempt} className="w-full gap-2 py-3" size="lg">
                <Play size={18} /> {assessment.attemptStatus === 'started' ? 'Resume Assessment' : 'Start Assessment'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AssessmentLobby;
