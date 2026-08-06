import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProfileSkeleton } from '../components/common/Skeleton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Trophy, Award, Clock, Percent, Video, ArrowLeft, Star, BookOpen, CheckCircle,
  TrendingUp, Target, Zap, Code, FileText, AlignLeft, Calendar, Activity,
  ChevronRight, Medal, User, MapPin, GraduationCap, BarChart2, Shield, Mail, X
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
const PUBLIC_API = 'http://localhost:5000/api/public';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PASS_COLORS = ['#10b981', '#ef4444'];

const BADGE_ICONS = {
  trophy: <Trophy size={20} />, code: <Code size={20} />, check: <CheckCircle size={20} />,
  book: <BookOpen size={20} />, star: <Star size={20} />, award: <Award size={20} />,
  zap: <Zap size={20} />,
};
const BADGE_COLORS = {
  trophy: 'from-amber-400 to-yellow-300 text-amber-800 border-amber-200',
  code: 'from-violet-400 to-indigo-300 text-indigo-900 border-indigo-200',
  check: 'from-emerald-400 to-teal-300 text-emerald-900 border-emerald-200',
  book: 'from-blue-400 to-cyan-300 text-blue-900 border-blue-200',
  star: 'from-pink-400 to-rose-300 text-rose-900 border-rose-200',
  award: 'from-orange-400 to-amber-300 text-orange-900 border-orange-200',
  zap: 'from-slate-400 to-slate-300 text-slate-800 border-slate-200',
};

// ─── Stat Tile ────────────────────────────────────────────────────────────────
const StatTile = ({ icon, label, value, color = 'text-brand-600', bg = 'bg-brand-50' }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ title, icon, children, className = '', bodyClassName = 'p-6' }) => (
  <div className={`bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
      <span className="text-brand-600">{icon}</span>
      <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className={bodyClassName}>{children}</div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const Empty = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300 h-full">
    <span className="text-4xl">{icon}</span>
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [history, setHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle'); // idle, submitting, success

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          axios.get(`${PUBLIC_API}/profile/${id}`),
          axios.get(`${PUBLIC_API}/profile/${id}/analytics`),
        ]);
        if (profileRes.data?.status === 'success') {
          const d = profileRes.data.data;
          setProfile(d.profile);
          setSummary(d.summary);
          setSubjectPerformance(d.subjectPerformance || []);
          setHistory(d.assessmentHistory || []);
          setAchievements(d.achievements || []);
          setRecentActivity(d.recentActivity || []);
        }
        if (analyticsRes.data?.status === 'success') {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        setError('Could not load this student\'s profile. They may not exist.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return <ProfileSkeleton />;
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-black text-slate-800">Profile Not Found</h1>
        <p className="text-slate-500 max-w-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const memberYear = profile.memberSince ? new Date(profile.memberSince).getFullYear() : null;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => {
        setShowContactModal(false);
        setContactStatus('idle');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">A</span>
            <span className="font-bold text-slate-800">AssessLMS</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Public Profile</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-8">

        {/* ── HERO: Profile card ───────────────────────────────────────────── */}
        <div className="relative bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden">
          {/* gradient banner */}
          <div className="h-36 bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 0%, transparent 50%), radial-gradient(circle at 75% 50%, white 0%, transparent 50%)' }} />
            {/* Rank badge */}
            {summary?.globalRank <= 5 && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1.5 rounded-full shadow">
                <Trophy size={12} /> Rank #{summary.globalRank}
              </div>
            )}
          </div>

          <div className="px-6 md:px-10 pb-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6 -mt-14 relative z-10">
              {/* Avatar */}
              <div className="relative shrink-0 z-20">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-5xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                  <CheckCircle size={14} className="text-white" />
                </span>
              </div>

              {/* Identity */}
              <div className="flex-1 pt-4 md:pt-16 relative z-20">
                <h1 className="text-3xl font-black text-slate-900 leading-tight capitalize">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {profile.college && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <GraduationCap size={13} /> {profile.college}
                    </span>
                  )}
                  {profile.department && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <BookOpen size={13} /> {profile.department}
                    </span>
                  )}
                  {profile.batch && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar size={13} /> Batch {profile.batch}
                    </span>
                  )}
                  {memberYear && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <User size={13} /> Member since {memberYear}
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-2xl italic">"{profile.bio}"</p>
                )}
              </div>

              {/* Connect Button */}
              <div className="shrink-0 flex items-center justify-center pt-6 md:pt-16 pb-2">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  <Mail size={18} />
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── VIDEO + KEY STATS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Video Bio */}
          <div className="lg:col-span-2">
            <Section
              title="Video Introduction"
              icon={<Video size={16} />}
              className="h-full flex flex-col"
              bodyClassName="p-6 flex-1 flex flex-col justify-center"
            >
              {profile.videoBioUrl ? (
                <video
                  src={profile.videoBioUrl}
                  controls
                  className="w-full h-full rounded-xl bg-black shadow-sm object-cover"
                  style={{ minHeight: '300px' }}
                />
              ) : (
                <Empty icon="🎬" message="No video introduction uploaded yet." />
              )}
            </Section>
          </div>

          {/* Key Stats */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile icon={<Trophy size={18} />} label="Global Rank" value={`#${summary.globalRank}`} color="text-amber-600" bg="bg-amber-50" />
            <StatTile icon={<Award size={18} />} label="Total Points" value={`${summary.totalPoints}`} color="text-brand-600" bg="bg-brand-50" />
            <StatTile icon={<Percent size={18} />} label="Avg Score" value={`${summary.averagePercentage}%`} color="text-emerald-600" bg="bg-emerald-50" />
            <StatTile icon={<Target size={18} />} label="Success Rate" value={`${summary.successRate}%`} color="text-blue-600" bg="bg-blue-50" />
            <StatTile icon={<CheckCircle size={18} />} label="Assessments Done" value={summary.assessmentsAttempted} color="text-violet-600" bg="bg-violet-50" />
            <StatTile icon={<TrendingUp size={18} />} label="Passed" value={summary.passCount} color="text-emerald-600" bg="bg-emerald-50" />
            <StatTile icon={<Clock size={18} />} label="Learning Hours" value={`${summary.learningHours}h`} color="text-orange-600" bg="bg-orange-50" />
            <StatTile icon={<Medal size={18} />} label="Subjects" value={subjectPerformance.length} color="text-pink-600" bg="bg-pink-50" />
          </div>
        </div>

        {/* ── ACHIEVEMENTS ────────────────────────────────────────────────── */}
        {achievements.length > 0 && (
          <Section title="Achievements & Badges" icon={<Award size={16} />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {achievements.map((badge, i) => {
                const colorClass = BADGE_COLORS[badge.icon] || BADGE_COLORS.zap;
                return (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${colorClass} border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm hover:scale-105 transition-transform`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">
                      {BADGE_ICONS[badge.icon] || <Award size={20} />}
                    </div>
                    <p className="font-bold text-xs leading-tight">{badge.title}</p>
                    <p className="text-[9px] opacity-75 leading-snug">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── CHARTS ROW ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Score Trend */}
          <Section title="Score Trend (Last 7 Tests)" icon={<TrendingUp size={16} />} className="lg:col-span-2">
            {analytics?.weeklyPerformance?.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.weeklyPerformance}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} fill="url(#scoreGrad)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty icon="📈" message="No score history yet." />}
          </Section>

          {/* Pass vs Fail */}
          <Section title="Pass / Fail Ratio" icon={<Shield size={16} />}>
            {analytics?.submissionAnalysis?.filter(i => i.value > 0).length > 0 ? (
              <div className="h-56 flex flex-col items-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={analytics.submissionAnalysis} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={4} dataKey="value">
                      {analytics.submissionAnalysis.map((_, i) => <Cell key={i} fill={PASS_COLORS[i % PASS_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-1">
                  {analytics.submissionAnalysis.map((e, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PASS_COLORS[i % PASS_COLORS.length] }} />
                      {e.name}: {e.value}
                    </span>
                  ))}
                </div>
              </div>
            ) : <Empty icon="📊" message="No results yet." />}
          </Section>
        </div>

        {/* ── CHARTS ROW 2 ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Averages */}
          <Section title="Monthly Averages" icon={<BarChart2 size={16} />} className="lg:col-span-2">
            {analytics?.monthlyPerformance?.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyPerformance} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty icon="📅" message="No monthly data." />}
          </Section>

          {/* Skill Radar */}
          <Section title="Skill Analysis" icon={<Target size={16} />}>
            {analytics?.skillAnalysis?.some(s => s.score > 0) ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.skillAnalysis}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : <Empty icon="🎯" message="No skill data yet." />}
          </Section>
        </div>

        {/* ── SUBJECT COMPARISON ──────────────────────────────────────────── */}
        {analytics?.subjectComparison?.length > 0 && (
          <Section title="Subject Performance vs Class Average" icon={<BarChart2 size={16} />}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subjectComparison} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="student" name={profile?.name || "Student"} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average" name="Class Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* ── SUBJECT PROFICIENCY BARS ────────────────────────────────────── */}
        {subjectPerformance.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Subject Proficiency" icon={<BookOpen size={16} />}>
              <div className="space-y-4">
                {subjectPerformance.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{s.subjectName} <span className="text-slate-400">({s.subjectCode})</span></span>
                      <span className="font-black text-brand-600">{s.averagePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${s.averagePercentage}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.assessmentCount} assessment{s.assessmentCount !== 1 ? 's' : ''} taken</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Assessment type breakdown */}
            {analytics?.problemsSolved?.length > 0 && (
              <Section title="Assessment Type Breakdown" icon={<Activity size={16} />}>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie data={analytics.problemsSolved} cx="50%" cy="50%" outerRadius={55} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {analytics.problemsSolved.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}
          </div>
        )}

        {/* ── RECENT ACTIVITY TIMELINE ────────────────────────────────────── */}
        {recentActivity.length > 0 && (
          <Section title="Recent Activity" icon={<Activity size={16} />}>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.result === 'pass' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {act.result === 'pass' ? <CheckCircle size={15} /> : <Target size={15} />}
                    </div>
                    {i < recentActivity.length - 1 && <div className="w-0.5 h-4 bg-slate-100 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-semibold text-slate-700">{act.label}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {act.subject && <span className="text-[10px] text-slate-400">{act.subject}</span>}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.result === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {act.percentage}% — {act.result?.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(act.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── ASSESSMENT HISTORY TABLE ────────────────────────────────────── */}
        <Section title="Full Assessment History" icon={<FileText size={16} />} className="overflow-x-auto">
          {history.length > 0 ? (
            <div className="-m-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Assessment', 'Subject', 'Type', 'Date', 'Score', '%', 'Result'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800 max-w-[180px] truncate">{r.assessmentName}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.assessmentType === 'coding' ? 'bg-violet-50 text-violet-700' : r.assessmentType === 'theory' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          {r.assessmentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{r.marksObtained}/{r.totalMarks}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{r.percentage}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {r.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty icon="📋" message="No assessments taken yet." />}
        </Section>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-4">
          Public profile · AssessLMS · Only public information is shown
        </div>
      </div>

      {/* ── CONTACT MODAL ─────────────────────────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Mail className="text-brand-600" size={20} />
                Connect with {profile.name.split(' ')[0]}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {contactStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">Request Sent!</h4>
                  <p className="text-slate-500 text-sm">
                    Thank you! We've received your request and will connect you with {profile.name} shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <p className="text-sm text-slate-500 mb-2">
                    Please provide your details below and we will help facilitate an introduction.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                      placeholder={`I'm interested in connecting with ${profile.name} regarding...`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={contactStatus === 'submitting'}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                  >
                    {contactStatus === 'submitting' ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail size={18} />
                        Send Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
