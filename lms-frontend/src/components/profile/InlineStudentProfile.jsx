import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import Table from '../common/Table';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Trophy, Award, Clock, Percent, Video, ChevronUp } from 'lucide-react';

const PUBLIC_API = 'http://localhost:5000/api/public';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MEDAL_CONFIG = {
  1: { color: 'from-amber-400 to-yellow-300', border: 'border-amber-300', text: 'text-amber-800', ring: 'ring-amber-400', bg: 'bg-amber-50' },
  2: { color: 'from-slate-300 to-slate-200', border: 'border-slate-300', text: 'text-slate-700', ring: 'ring-slate-300', bg: 'bg-slate-50' },
  3: { color: 'from-orange-300 to-amber-200', border: 'border-orange-300', text: 'text-orange-800', ring: 'ring-orange-300', bg: 'bg-orange-50' },
  4: { color: 'from-indigo-200 to-purple-100', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-300', bg: 'bg-indigo-50' },
  5: { color: 'from-emerald-200 to-teal-100', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-300', bg: 'bg-emerald-50' },
};

/**
 * Renders the complete public student profile inline — no page navigation.
 * @param {string}   studentId – MongoDB _id of the student
 * @param {number}   rank      – leaderboard rank (drives medal colour)
 * @param {function} onClose   – called when the user collapses the panel
 */
const InlineStudentProfile = ({ studentId, rank = 1, onClose }) => {
  const panelRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [subjectPerformance, setSubjectPerf] = useState([]);
  const [history, setHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const medal = MEDAL_CONFIG[rank] || MEDAL_CONFIG[5];

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      setLoading(true);
      setProfile(null);
      try {
        const [pRes, aRes] = await Promise.all([
          axios.get(`${PUBLIC_API}/profile/${studentId}`),
          axios.get(`${PUBLIC_API}/profile/${studentId}/analytics`),
        ]);
        if (pRes.data?.status === 'success') {
          const { profile, summary, subjectPerformance, assessmentHistory, achievements } = pRes.data.data;
          setProfile(profile);
          setSummary(summary);
          setSubjectPerf(subjectPerformance || []);
          setHistory(assessmentHistory || []);
          setAchievements(achievements || []);
        }
        if (aRes.data?.status === 'success') setAnalytics(aRes.data.data);
      } catch (e) {
        console.warn('InlineStudentProfile fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  // Smooth scroll to panel when it opens
  useEffect(() => {
    if (panelRef.current) {
      setTimeout(() => panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, [studentId]);

  const historyColumns = [
    { header: 'Assessment', accessor: 'assessmentName' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Type', accessor: (r) => <span className="uppercase text-xs font-semibold text-slate-500">{r.assessmentType}</span> },
    { header: 'Date', accessor: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Marks', accessor: (r) => `${r.marksObtained} / ${r.totalMarks}` },
    { header: '%', accessor: (r) => `${r.percentage}%` },
    {
      header: 'Result',
      accessor: (r) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.status === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {r.status === 'pass' ? 'PASS' : 'FAIL'}
        </span>
      ),
    },
  ];

  return (
    <div ref={panelRef} className={`mt-6 rounded-2xl border-2 ${medal.border} bg-white shadow-xl overflow-hidden`}>

      {/* ─── Header ─── */}
      <div className={`bg-gradient-to-r ${medal.color} border-b ${medal.border} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Trophy size={20} className={medal.text} />
          <span className={`font-black text-lg ${medal.text}`}>
            {loading ? 'Loading…' : (profile?.name || 'Student Profile')}
          </span>
          {!loading && profile && (
            <span className={`text-xs ${medal.text} opacity-70 font-medium`}>— Rank #{rank}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/70 hover:bg-white rounded-lg px-3 py-1.5 transition-colors text-slate-700 shadow-sm"
        >
          <ChevronUp size={14} /> Collapse
        </button>
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div className="p-10 flex flex-col items-center gap-3 text-slate-400">
          <span className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading full profile…</p>
        </div>
      )}

      {/* ─── Error ─── */}
      {!loading && !profile && (
        <div className="p-10 text-center text-slate-500 text-sm">Could not load this student's profile.</div>
      )}

      {/* ─── Profile body ─── */}
      {!loading && profile && summary && (
        <div className="p-6 space-y-6">

          {/* ROW 1: Bio + Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Bio card */}
            <div className={`rounded-2xl border ${medal.border} ${medal.bg} p-6 flex flex-col items-center text-center gap-3`}>
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name}
                  className={`w-24 h-24 rounded-full object-cover ring-4 ${medal.ring} shadow-md`} />
              ) : (
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${medal.color} ${medal.text} flex items-center justify-center font-black text-4xl ring-4 ${medal.ring} shadow-inner`}>
                  {profile.name.charAt(0)}
                </div>
              )}

              <div>
                <h2 className="text-lg font-black text-slate-900">{profile.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{profile.college || 'College N/A'}</p>
                <p className="text-xs text-slate-500">{profile.department}{profile.batch ? ` · Batch ${profile.batch}` : ''}</p>
              </div>

              <p className="text-xs text-slate-600 italic bg-white/70 p-3 rounded-xl border border-white/80 leading-relaxed w-full">
                {profile.bio || "No bio provided."}
              </p>


            </div>

            {/* Metric tiles */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Trophy className="text-amber-500" size={22} />, label: 'Global Rank', value: `#${summary.globalRank}` },
                { icon: <Award className="text-brand-500" size={22} />, label: 'Total Points', value: `${summary.totalPoints} pts` },
                { icon: <Percent className="text-emerald-500" size={22} />, label: 'Avg %', value: `${summary.averagePercentage}%` },
                { icon: <Clock className="text-blue-500" size={22} />, label: 'Time Spent', value: `${Math.round(summary.totalTimeSpent / 60)} min` },
              ].map((m, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  {m.icon}
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{m.label}</p>
                    <p className="text-2xl font-black text-slate-800">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2: Charts + Right column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Weekly Score Progression">
                  {analytics?.weeklyPerformance?.length > 0 ? (
                    <div className="h-52">
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
                  ) : <p className="text-center py-10 text-xs text-slate-400">No history yet.</p>}
                </Card>

                <Card title="Monthly Cumulative Averages">
                  {analytics?.monthlyPerformance?.length > 0 ? (
                    <div className="h-52">
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
                  ) : <p className="text-center py-10 text-xs text-slate-400">No monthly data.</p>}
                </Card>
              </div>

              <Card title="Subject Performance vs Class Average">
                {analytics?.subjectComparison?.length > 0 ? (
                  <div className="h-56">
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
                ) : <p className="text-center py-10 text-xs text-slate-400">No subject comparisons.</p>}
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <Card title="Earned Badges">
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {achievements.map((b, i) => (
                      <div key={i} className="p-3 border border-brand-100 rounded-xl bg-brand-50/20 text-center flex flex-col items-center gap-1">
                        <Award className="text-brand-500" size={24} />
                        <p className="font-bold text-slate-800 text-xs">{b.title}</p>
                        <p className="text-[9px] text-slate-400">{b.description}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center py-6 text-xs text-slate-400">No badges yet.</p>}
              </Card>

              <Card title="Subject Proficiency">
                {subjectPerformance.length > 0 ? (
                  <div className="space-y-3">
                    {subjectPerformance.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">{s.subjectName} ({s.subjectCode})</span>
                          <span className="font-bold text-brand-600">{s.averagePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${s.averagePercentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center py-6 text-xs text-slate-400">No subject records.</p>}
              </Card>

              <Card title="Completion Splits">
                {analytics?.problemsSolved?.length > 0 ? (
                  <>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.problemsSolved} cx="50%" cy="50%" innerRadius={38} outerRadius={56} paddingAngle={4} dataKey="value">
                            {analytics.problemsSolved.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      {analytics.problemsSolved.map((e, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {e.name}
                        </span>
                      ))}
                    </div>
                  </>
                ) : <p className="text-center py-6 text-xs text-slate-400">No distribution data.</p>}
              </Card>
            </div>
          </div>

          {/* ROW 3: Attempt History */}
          <Card title="Assessment Attempt History" bodyClassName="p-0">
            <Table columns={historyColumns} data={history} emptyMessage="No assessments attempted yet." />
          </Card>
        </div>
      )}
    </div>
  );
};

export default InlineStudentProfile;
