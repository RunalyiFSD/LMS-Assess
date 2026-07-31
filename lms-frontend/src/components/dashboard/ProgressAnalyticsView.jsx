import React, { useState } from 'react';
import {
  TrendingUp, Calendar, Download, Target, ClipboardList,
  Zap, Award, ChevronDown, Trophy, AlertTriangle, Lightbulb,
  ArrowUpRight, CheckCircle2, BarChart2, Printer, X
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import PerformanceReport from './PerformanceReport';

// Custom label rendered right above each data point on weekly line chart
const CustomValueLabel = (props) => {
  const { x, y, value } = props;
  if (x === undefined || y === undefined || value === undefined) return null;
  return (
    <text
      x={x}
      y={y - 12}
      fill="#1E293B"
      fontSize={11}
      fontWeight={800}
      textAnchor="middle"
    >
      {value}%
    </text>
  );
};

const ProgressAnalyticsView = ({ analyticsData, userProfile }) => {
  const [timeframe, setTimeframe] = useState('This Week');
  const [weeklyMetric, setWeeklyMetric] = useState('Score (%)');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Dynamic values derived from backend analyticsData (with fallbacks if no history exists yet)
  const averageScore = analyticsData?.averageScore ?? 78.6;
  const assessmentsTaken = analyticsData?.assessmentsTaken ?? 24;
  const codingSpeed = analyticsData?.codingSpeed ?? 215;
  const accuracy = analyticsData?.accuracy ?? 92.3;
  const percentileRank = analyticsData?.percentileRank ?? 'Top 18%';

  // Dynamic weekly chart data
  const defaultWeeklyData = [
    { day: 'Mon', score: 62, avg: 55 },
    { day: 'Tue', score: 68, avg: 58 },
    { day: 'Wed', score: 74, avg: 60 },
    { day: 'Thu', score: 85, avg: 65 },
    { day: 'Fri', score: 78, avg: 64 },
    { day: 'Sat', score: 90, avg: 70 },
    { day: 'Sun', score: 82, avg: 68 },
  ];
  const weeklyData = (analyticsData?.weeklyPerformance && analyticsData.weeklyPerformance.length > 0)
    ? analyticsData.weeklyPerformance
    : defaultWeeklyData;

  const defaultAccuracyData = [
    { day: 'Mon', accuracy: 78 },
    { day: 'Tue', accuracy: 81 },
    { day: 'Wed', accuracy: 85 },
    { day: 'Thu', accuracy: 90 },
    { day: 'Fri', accuracy: 88 },
    { day: 'Sat', accuracy: 92 },
    { day: 'Sun', accuracy: 93 },
  ];

  // Skill Radar logic:
  // If 3 or more subjects are entered, dynamically display all subjects.
  // Otherwise (e.g. only 1 subject like "MOCKS"), display the 3-axis Skill Analysis radar (Image 2: MCQ Accuracy, Coding Logic, Theory Mastery).
  const defaultSkillRadar = (analyticsData?.skillAnalysis && analyticsData.skillAnalysis.length >= 3)
    ? analyticsData.skillAnalysis.map(s => ({
        subject: s.name,
        score: s.score || 80,
        avgScore: Math.max(20, (s.score || 80) - 20)
      }))
    : [
        { subject: 'MCQ Accuracy', score: accuracy || 92, avgScore: 65 },
        { subject: 'Coding Logic', score: Math.min(100, Math.round(codingSpeed / 2.5)) || 75, avgScore: 60 },
        { subject: 'Theory Mastery', score: Math.round(averageScore) || 80, avgScore: 55 }
      ];

  const skillRadarData = (analyticsData?.subjectComparison && analyticsData.subjectComparison.length >= 3)
    ? analyticsData.subjectComparison.map(s => ({
        subject: s.subject,
        score: s.student || 70,
        avgScore: s.average || 60
      }))
    : defaultSkillRadar;

  const defaultTopicsList = [
    { name: 'Web Development', score: 90, status: 'Excellent' },
    { name: 'Problem Solving', score: 85, status: 'Very Good' },
    { name: 'Data Structures', score: 80, status: 'Good' },
    { name: 'Algorithms', score: 75, status: 'Good' },
    { name: 'DBMS', score: 70, status: 'Average' },
    { name: 'System Design', score: 65, status: 'Needs Improvement' },
  ];

  const topicsList = (analyticsData?.topicPerformance && analyticsData.topicPerformance.length > 0)
    ? analyticsData.topicPerformance
    : defaultTopicsList;

  const strongestTopic = analyticsData?.strongestTopic || topicsList[0] || { name: 'Web Development', score: 90 };
  const weakestTopic = analyticsData?.weakestTopic || topicsList[topicsList.length - 1] || { name: 'System Design', score: 65 };

  const handleDownloadReport = () => {
    setShowReportModal(true);
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 print:hidden">
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Track your progress and improve every day</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Timeframe Dropdown */}
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-4 py-2.5 pr-8 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
              >
                <option value="This Week">This Week</option>
                <option value="Last 4 Weeks">Last 4 Weeks</option>
                <option value="This Month">This Month</option>
                <option value="All Time">All Time</option>
              </select>
              <Calendar size={14} className="absolute left-3 top-3 text-indigo-500 pointer-events-none hidden" />
              <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Download Report Button */}
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Download size={15} />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* ── 5 TOP STAT CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Average Score */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Average Score</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Target size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{averageScore}%</h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <span>↑ 8.4%</span>
                <span className="text-slate-400 font-normal">vs last 4 weeks</span>
              </div>
            </div>
          </div>

          {/* Card 2: Assessments Taken */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Assessments Taken</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <ClipboardList size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{assessmentsTaken}</h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <span>↑ 14%</span>
                <span className="text-slate-400 font-normal">vs last 4 weeks</span>
              </div>
            </div>
          </div>

          {/* Card 3: Coding Speed */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Coding Speed</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Zap size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{codingSpeed}</h3>
                <span className="text-xs font-semibold text-slate-400">lines / hr</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <span>↑ 12%</span>
                <span className="text-slate-400 font-normal">vs last 4 weeks</span>
              </div>
            </div>
          </div>

          {/* Card 4: Accuracy */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Accuracy</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{accuracy}%</h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <span>↑ 6.7%</span>
                <span className="text-slate-400 font-normal">vs last 4 weeks</span>
              </div>
            </div>
          </div>

          {/* Card 5: Percentile Rank */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Percentile Rank</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Award size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{percentileRank}</h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <span>↑ 5%</span>
                <span className="text-slate-400 font-normal">vs last 4 weeks</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MIDDLE ROW (WEEKLY PERFORMANCE & SKILLS OVERVIEW) ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Performance (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">Weekly Performance</h2>
              <div className="relative">
                <select
                  value={weeklyMetric}
                  onChange={(e) => setWeeklyMetric(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="Score (%)">Score (%)</option>
                  <option value="Speed (lines/hr)">Speed (lines/hr)</option>
                  <option value="Accuracy (%)">Accuracy (%)</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Area Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 25, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: 12 }}
                    formatter={(val) => [`${val}%`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#weeklyGradient)"
                    dot={{ r: 4, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#6D28D9' }}
                    label={<CustomValueLabel />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Highlights (Best Day & Most Improved) */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Best Day</span>
                    <span className="text-xs font-black text-slate-800">
                      {[...weeklyData].sort((a, b) => b.score - a.score)[0]?.day || 'Saturday'}
                    </span>
                  </div>
                </div>
                <span className="text-base font-black text-purple-700">
                  {[...weeklyData].sort((a, b) => b.score - a.score)[0]?.score || 90}%
                </span>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Most Improved</span>
                    <span className="text-xs font-black text-slate-800">Thursday</span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-600 flex items-center gap-0.5">
                  ↑ 17%
                </span>
              </div>
            </div>
          </div>

          {/* Skills Overview (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                Skills Overview
                <span className="text-slate-400 font-normal text-xs">(Skill Radar)</span>
              </h2>
              <button className="border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-[11px] font-bold px-3 py-1 rounded-lg transition-colors">
                View All
              </button>
            </div>

            {/* Radar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={skillRadarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload }) => {
                      const skillVal = skillRadarData.find(s => s.subject === payload.value)?.score;
                      return (
                        <text x={x} y={y} fill="#475569" fontSize={10} fontWeight={700} textAnchor="middle" dy={payload.value === 'Problem Solving' ? -8 : 12}>
                          <tspan x={x} dy="0">{payload.value}</tspan>
                          <tspan x={x} dy="11" fill="#6D28D9" fontWeight="800">{skillVal}%</tspan>
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="You"
                    dataKey="score"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Average of All Students"
                    dataKey="avgScore"
                    stroke="#94A3B8"
                    fill="none"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                <span className="text-slate-800 font-bold">You</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 border-t-2 border-dashed border-slate-400 inline-block"></span>
                <span className="text-slate-400 font-medium">Average of All Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW (ACCURACY TREND, TOPIC PERFORMANCE, STRONGEST/WEAKEST) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Column 1: Accuracy Trend (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">Accuracy Trend</h2>
              <div className="relative">
                <select className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg px-2.5 py-1 pr-6 focus:outline-none cursor-pointer">
                  <option>This Week</option>
                  <option>Last 4 Weeks</option>
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Mini Line/Area Chart */}
            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={defaultAccuracyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [`${val}%`, 'Accuracy']} />
                  <Area type="monotone" dataKey="accuracy" stroke="#7C3AED" strokeWidth={2} fill="url(#accuracyGrad)" dot={{ r: 3, fill: '#7C3AED' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Summary Callout */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-xl">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">Average Accuracy</span>
                <span className="text-sm font-black text-slate-800">{accuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">Change vs last 4 weeks</span>
                <span className="text-sm font-black text-emerald-600">↑ 6.7%</span>
              </div>
            </div>
          </div>

          {/* Column 2: Topic Performance (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight mb-3">Topic Performance</h2>
              
              {/* Table Header */}
              <div className="grid grid-cols-12 text-[10px] font-extrabold uppercase text-slate-400 pb-2 border-b border-slate-100">
                <span className="col-span-5">Topic</span>
                <span className="col-span-2 text-center">Score</span>
                <span className="col-span-5 text-right">Performance</span>
              </div>

              {/* List */}
              <div className="space-y-3 mt-3">
                {topicsList.map((topic, idx) => {
                  const getStatusStyle = (status) => {
                    if (status === 'Excellent' || status === 'Very Good') return 'text-emerald-600 bg-emerald-500';
                    if (status === 'Good' || status === 'Average') return 'text-amber-600 bg-amber-500';
                    return 'text-rose-600 bg-rose-500';
                  };
                  const style = getStatusStyle(topic.status);
                  const barColor = style.split(' ')[1];
                  const textColor = style.split(' ')[0];

                  return (
                    <div key={idx} className="grid grid-cols-12 items-center text-xs">
                      <span className="col-span-5 font-bold text-slate-700 truncate">{topic.name}</span>
                      <span className="col-span-2 font-black text-slate-800 text-center">{topic.score}%</span>
                      <div className="col-span-5 flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${topic.score}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${textColor} w-24 text-right truncate`}>
                          {topic.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center mt-3">
              <button
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>View All Topics</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Column 3: Strongest & Weakest Topic Cards (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Card 1: Strongest Topic */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between flex-1 shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Trophy size={13} />
                    </div>
                    <span>Strongest Topic</span>
                  </div>
                  <span className="bg-emerald-100/90 text-emerald-800 font-black text-xs px-2.5 py-0.5 rounded-full">
                    {strongestTopic.score}%
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">{strongestTopic.name}</h3>
                <p className="text-xs text-slate-500 mt-1">You excel in this topic! Keep it up.</p>
              </div>

              <div className="mt-3">
                <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${strongestTopic.score}%` }} />
                </div>
              </div>
            </div>

            {/* Card 2: Weakest Topic */}
            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between flex-1 shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertTriangle size={13} />
                    </div>
                    <span>Weakest Topic</span>
                  </div>
                  <span className="bg-rose-100/90 text-rose-800 font-black text-xs px-2.5 py-0.5 rounded-full">
                    {weakestTopic.score}%
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">{weakestTopic.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Focus more on this area to improve.</p>
              </div>

              <div className="mt-3">
                <div className="w-full bg-rose-200/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${weakestTopic.score}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BANNER ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-slate-50 border border-indigo-100/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200/60 flex items-center justify-center text-purple-600 flex-shrink-0 shadow-2xs">
            <Lightbulb size={20} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-purple-950 tracking-tight">Keep learning, keep improving!</h4>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Consistent practice today leads to success tomorrow.</p>
          </div>
        </div>
      </div>

      {/* ── REPORT PREVIEW MODAL & PRINT CONTAINER ─────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:block">
          <div className="bg-white rounded-3xl max-w-[900px] w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative space-y-4 print:max-h-none print:shadow-none print:p-0 print:overflow-visible">
            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <span className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                📄 Performance Report Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Performance Report Document Component */}
            <PerformanceReport analyticsData={analyticsData} userProfile={userProfile} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProgressAnalyticsView;
