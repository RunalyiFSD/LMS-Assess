import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { User, Award, Calendar, BookOpen, Clock, Activity, Percent, ArrowLeft } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [history, setHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch core profile information
        const profileRes = await api.get(`/users/profile/${id}`);
        if (profileRes.data?.status === 'success') {
          const { profile, summary, subjectPerformance, assessmentHistory, achievements } = profileRes.data.data;
          setProfile(profile);
          setSummary(summary);
          setSubjectPerformance(subjectPerformance || []);
          setHistory(assessmentHistory || []);
          setAchievements(achievements || []);
        }

        // Fetch analytical chart coordinates
        const analyticsRes = await api.get(`/users/profile/${id}/analytics`);
        if (analyticsRes.data?.status === 'success') {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        console.warn('Failed to load profile analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
          <span className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-sm">Generating student analytical profile...</p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-slate-500">Student profile could not be loaded.</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </Layout>
    );
  }

  // Format table columns
  const columns = [
    { header: 'Assessment', accessor: 'assessmentName' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Type', accessor: (row) => <span className="uppercase font-semibold text-xs text-slate-500">{row.assessmentType}</span> },
    { header: 'Date', accessor: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Marks Obtained', accessor: (row) => `${row.marksObtained} / ${row.totalMarks}` },
    { header: 'Percentage', accessor: (row) => `${row.percentage}%` },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          row.status === 'pass' ? 'bg-emerald-50 text-accent-success' : 'bg-red-50 text-accent-danger'
        }`}>
          {row.status === 'pass' ? 'PASS' : 'FAIL'}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      {/* Back button */}
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={14} /> Back
        </Button>
      </div>

      {/* Profile Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bio Card */}
        <Card className="lg:col-span-1 flex flex-col items-center text-center p-6 justify-center">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-3xl shadow-inner">
              {profile.name.charAt(0)}
            </div>
          )}
          <h2 className="text-xl font-bold text-slate-900 mt-4">{profile.name}</h2>
          <p className="text-xs text-slate-400 capitalize font-medium">{profile.college || 'College N/A'}</p>
          <p className="text-xs text-slate-500 mt-1">{profile.department} | Batch of {profile.batch || 'N/A'}</p>
          <p className="text-xs text-slate-500 italic mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full">
            {profile.bio || "Student hasn't provided a bio yet."}
          </p>
        </Card>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <Trophy className="text-amber-500" size={24} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Global Rank</span>
              <p className="text-2xl font-black text-slate-800">#{summary.globalRank}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <Award className="text-brand-500" size={24} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Total Points</span>
              <p className="text-2xl font-black text-slate-800">{summary.totalPoints} pts</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <Percent className="text-emerald-500" size={24} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Avg Percentage</span>
              <p className="text-2xl font-black text-slate-800">{summary.averagePercentage}%</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <Clock className="text-blue-500" size={24} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Time Spent</span>
              <p className="text-xl font-black text-slate-800">
                {Math.round(summary.totalTimeSpent / 60)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left analytics / Right subjects & badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Columns Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly / Monthly Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Weekly Score Progression">
              {analytics?.weeklyPerformance?.length > 0 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.weeklyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-xs text-slate-400">No score history available.</p>
              )}
            </Card>

            <Card title="Monthly Cumulative Averages">
              {analytics?.monthlyPerformance?.length > 0 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-xs text-slate-400">No monthly history available.</p>
              )}
            </Card>
          </div>

          {/* Subject Comparison */}
          <Card title="Subject Performance Comparison (vs Class Average)">
            {analytics?.subjectComparison?.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.subjectComparison}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="student" fill="#6366f1" name="Student Score" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="average" fill="#cbd5e1" name="Class Average" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-slate-400">No subject comparisons found.</p>
            )}
          </Card>
        </div>

        {/* Right Columns: Badges & progress bars */}
        <div className="lg:col-span-1 space-y-6">
          {/* Achievements Badges */}
          <Card title="Earned Badges">
            {achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-brand-100 rounded-xl bg-brand-50/20 text-center flex flex-col items-center gap-1.5 transition-micro hover:scale-105"
                  >
                    <Award className="text-brand-500" size={28} />
                    <p className="font-bold text-slate-800 text-xs">{badge.title}</p>
                    <p className="text-[9px] text-slate-400 leading-snug">{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">No badges earned yet.</p>
            )}
          </Card>

          {/* Subject Performance List */}
          <Card title="Subject Proficiency">
            {subjectPerformance.length > 0 ? (
              <div className="space-y-4">
                {subjectPerformance.map((sub, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">
                        {sub.subjectName} ({sub.subjectCode})
                      </span>
                      <span className="font-bold text-brand-600">{sub.averagePercentage}%</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sub.averagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">No subject records available.</p>
            )}
          </Card>

          {/* Distribution Pies */}
          <Card title="Completion & Solved Splits">
            {analytics?.problemsSolved?.length > 0 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.problemsSolved}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.problemsSolved.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-500">
                  {analytics.problemsSolved.map((entry, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      {entry.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-xs text-slate-400">No distribution records found.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Assessment History Table */}
      <Card title="Assessment Attempt History" bodyClassName="p-0">
        <Table columns={columns} data={history} emptyMessage="Student has not attempted any assessments." />
      </Card>
    </Layout>
  );
};

export default PublicProfile;
