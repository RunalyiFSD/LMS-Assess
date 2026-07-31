import React from 'react';
import {
  TrendingUp, Calendar, Target, ClipboardList, Zap, Award,
  CheckCircle2, Trophy, AlertTriangle, Lightbulb
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const CustomValueLabel = (props) => {
  const { x, y, value } = props;
  if (x === undefined || y === undefined || value === undefined) return null;
  return (
    <text
      x={x}
      y={y - 10}
      fill="#1E293B"
      fontSize={10}
      fontWeight={800}
      textAnchor="middle"
    >
      {value}%
    </text>
  );
};

const PerformanceReport = ({ analyticsData, userProfile, onClose, isPrintView = false }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const studentName = userProfile?.name || 'Riya Sharma';
  const studentId = userProfile?.studentId || (userProfile?._id ? `STU${userProfile._id.substring(0, 8).toUpperCase()}` : 'STU20240056');
  const course = userProfile?.department || userProfile?.college || 'B.Tech Computer Science';
  const batch = userProfile?.batch || '2024-2028';

  const averageScore = analyticsData?.averageScore ?? 78.6;
  const assessmentsTaken = analyticsData?.assessmentsTaken ?? 24;
  const codingSpeed = analyticsData?.codingSpeed ?? 215;
  const accuracy = analyticsData?.accuracy ?? 92.3;

  const defaultWeeklyData = [
    { day: 'Mon', score: 62 },
    { day: 'Tue', score: 68 },
    { day: 'Wed', score: 74 },
    { day: 'Thu', score: 85 },
    { day: 'Fri', score: 78 },
    { day: 'Sat', score: 90 },
    { day: 'Sun', score: 82 },
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

  const defaultSkillRadar = [
    { subject: 'Problem Solving', score: 85 },
    { subject: 'Data Structures', score: 80 },
    { subject: 'Algorithms', score: 75 },
    { subject: 'DBMS', score: 70 },
    { subject: 'System Design', score: 65 },
    { subject: 'Web Development', score: 90 },
  ];

  const skillRadarData = (analyticsData?.subjectComparison && analyticsData.subjectComparison.length >= 3)
    ? analyticsData.subjectComparison.map(s => ({
        subject: s.subject,
        score: s.student || 70,
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

  return (
    <div className="bg-white text-slate-900 w-full max-w-[850px] mx-auto p-8 border border-slate-200 rounded-3xl shadow-2xl space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            M
          </div>
          <div>
            <span className="font-black text-xl text-slate-900 tracking-tight block">EduFlow</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Performance Report</h1>
            <p className="text-xs text-slate-500 font-medium">Overview of your performance and progress</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
            <Calendar size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Report Generated On</span>
            <span className="text-xs font-bold text-slate-800">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* ── STUDENT PROFILE BANNER & 4 STAT CARDS ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Student Info */}
        <div className="md:col-span-5 bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center flex-shrink-0 shadow-md">
            {studentName.charAt(0)}
          </div>
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 text-base leading-snug">{studentName}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Student ID: <span className="font-semibold text-slate-700">{studentId}</span></p>
            <p className="text-[11px] text-slate-500 font-medium">Course: <span className="font-semibold text-slate-700">{course}</span></p>
            <p className="text-[11px] text-slate-500 font-medium">Batch: <span className="font-semibold text-slate-700">{batch}</span></p>
          </div>
        </div>

        {/* Right 4 Stat Cards */}
        <div className="md:col-span-7 grid grid-cols-4 gap-2.5">
          {/* Card 1: Assessments Taken */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assessments</span>
              <span className="text-base font-black text-slate-900">{assessmentsTaken}</span>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Target size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
              <span className="text-base font-black text-slate-900">{averageScore}%</span>
            </div>
          </div>

          {/* Card 3: Coding Speed */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Speed</span>
              <span className="text-base font-black text-slate-900">{codingSpeed} <span className="text-[9px] font-normal text-slate-400">l/h</span></span>
            </div>
          </div>

          {/* Card 4: Accuracy */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-base font-black text-slate-900">{accuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: PERFORMANCE OVERVIEW ──────────────────────────────── */}
      <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Performance Overview</h2>
        
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Left Line Chart */}
          <div className="col-span-8">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Weekly Performance</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 18, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repWeeklyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={2} fill="url(#repWeeklyGrad)" dot={{ r: 3, fill: '#7C3AED' }} label={<CustomValueLabel />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Highlight Cards */}
          <div className="col-span-4 space-y-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Calendar size={15} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Best Day</span>
                  <span className="text-xs font-bold text-slate-800">Saturday</span>
                </div>
              </div>
              <span className="text-xs font-black text-purple-600">(90%)</span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <TrendingUp size={15} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Most Improved</span>
                  <span className="text-xs font-bold text-slate-800">Thursday</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600">(↑ 17%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: SKILLS ANALYSIS ────────────────────────────────────── */}
      <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Skills Analysis</h2>

        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Left Radar Chart */}
          <div className="col-span-6">
            <h3 className="text-xs font-bold text-slate-700 mb-1">Skill Radar</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={skillRadarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload }) => {
                      const val = skillRadarData.find(s => s.subject === payload.value)?.score;
                      return (
                        <text x={x} y={y} fill="#475569" fontSize={9} fontWeight={700} textAnchor="middle">
                          <tspan x={x} dy="0">{payload.value}</tspan>
                          <tspan x={x} dy="10" fill="#6D28D9" fontWeight="800">{val}%</tspan>
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Strongest & Weakest Topic Cards */}
          <div className="col-span-6 space-y-3">
            {/* Strongest */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <Trophy size={14} />
                  <span>Strongest Topic</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2 py-0.5 rounded-full">
                  {strongestTopic.score}%
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{strongestTopic.name}</h4>
              <p className="text-[11px] text-slate-500">You excel in this topic! Keep it up.</p>
              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${strongestTopic.score}%` }} />
              </div>
            </div>

            {/* Weakest */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                  <AlertTriangle size={14} />
                  <span>Weakest Topic</span>
                </div>
                <span className="bg-rose-100 text-rose-700 font-black text-xs px-2 py-0.5 rounded-full">
                  {weakestTopic.score}%
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{weakestTopic.name}</h4>
              <p className="text-[11px] text-slate-500">Focus more on this area to improve.</p>
              <div className="w-full bg-rose-200/60 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${weakestTopic.score}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: ACCURACY TREND & TOPIC PERFORMANCE ──────────────── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Accuracy Trend */}
        <div className="col-span-6 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Accuracy Trend</h3>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={defaultAccuracyData} margin={{ top: 12, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repAccGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} fill="url(#repAccGrad)" dot={{ r: 3, fill: '#10B981' }} label={<CustomValueLabel />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 bg-slate-50/50 p-2 rounded-xl text-center">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block">Average Accuracy</span>
              <span className="text-xs font-black text-slate-900">{accuracy}%</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block">Change vs last 4 weeks</span>
              <span className="text-xs font-black text-emerald-600">↑ 6.7%</span>
            </div>
          </div>
        </div>

        {/* Right Topic Performance Table */}
        <div className="col-span-6 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Topic Performance</h3>
            <div className="grid grid-cols-12 text-[9px] font-extrabold uppercase text-slate-400 border-b border-slate-100 pb-1">
              <span className="col-span-5">Topic</span>
              <span className="col-span-2 text-center">Score</span>
              <span className="col-span-5 text-right">Performance</span>
            </div>

            <div className="space-y-2 mt-2">
              {topicsList.map((topic, idx) => {
                const getStatusColor = (status) => {
                  if (status === 'Excellent' || status === 'Very Good') return 'text-emerald-600 bg-emerald-500';
                  if (status === 'Good' || status === 'Average') return 'text-amber-600 bg-amber-500';
                  return 'text-rose-600 bg-rose-500';
                };
                const style = getStatusColor(topic.status);
                const barColor = style.split(' ')[1];
                const textColor = style.split(' ')[0];

                return (
                  <div key={idx} className="grid grid-cols-12 items-center text-[11px]">
                    <span className="col-span-5 font-bold text-slate-700 truncate">{topic.name}</span>
                    <span className="col-span-2 font-black text-slate-800 text-center">{topic.score}%</span>
                    <div className="col-span-5 flex items-center justify-end gap-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div className={`h-1 rounded-full ${barColor}`} style={{ width: `${topic.score}%` }} />
                      </div>
                      <span className={`text-[9px] font-bold ${textColor} w-16 text-right truncate`}>
                        {topic.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BANNER & FOOTER ────────────────────────────────────────── */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={16} />
        </div>
        <div>
          <h4 className="text-xs font-black text-purple-950">Keep learning, keep improving!</h4>
          <p className="text-[10px] text-slate-500 font-medium">Consistent practice today leads to success tomorrow.</p>
        </div>
      </div>

      {/* Report Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
        <span>This is a system generated report</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

export default PerformanceReport;
