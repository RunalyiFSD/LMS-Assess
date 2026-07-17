import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { assessmentApi } from '../api/assessmentApi';
import { ClipboardList, ShieldAlert, Clock, Award, Play } from 'lucide-react';

const AssessmentLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      setLoading(true);
      try {
        const res = await assessmentApi.getById(id);
        if (res.data?.success) {
          setAssessment(res.data.data);
        }
        
        const qRes = await assessmentApi.getQuestions(id);
        if (qRes.data?.success) {
          setQuestionsCount(qRes.data.data.length);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assessment specifications');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessmentDetails();
  }, [id]);

  const handleBeginAttempt = async () => {
    try {
      const res = await assessmentApi.startSubmission(id);
      if (res.data?.success) {
        const submissionId = res.data.data.id;
        navigate(`/assessment/${submissionId}`);
      }
    } catch (err) {
      if (err.response?.data?.message === 'You have already submitted this assessment.') {
        alert('You have an active or completed submission for this assessment.');
        // If we wanted to, we could find the submission ID and redirect, but let's just go back for now
      } else {
        alert(err.response?.data?.message || 'Failed to start attempt session');
      }
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

        <Card title={assessment.title} subtitle={assessment.courses?.title}>
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
                  {questionsCount} Items
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Max Score</span>
                <span className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-1">
                  <Award size={16} className="text-emerald-500" /> {assessment.max_score} marks
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Overview Description</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
                {assessment.instructions || 'No detailed instructions configured.'}
              </p>
            </div>

            {/* Warnings Rules */}
            <div className="bg-red-50/50 border border-red-200/60 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-accent-danger font-bold text-xs uppercase tracking-wider">
                <ShieldAlert size={16} /> Exam Code of Conduct
              </div>
              <ul className="list-disc list-inside text-xs text-slate-500 space-y-1.5 leading-relaxed">
                <li>Once you click "Start Assessment", the countdown timer begins and cannot be paused.</li>
                <li>Auto-save operates periodically to lock your answers into the cloud.</li>
                <li>When the timer reaches 00:00, the system locks and submits your answers automatically.</li>
              </ul>
            </div>

            <Button onClick={handleBeginAttempt} className="w-full gap-2 py-3" size="lg">
              <Play size={18} /> Start Assessment
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AssessmentLobby;
