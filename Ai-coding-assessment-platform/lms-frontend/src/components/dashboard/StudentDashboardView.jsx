import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import api from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Award, Play, RotateCcw, ShieldCheck, Calendar, Clock,
  ClipboardList, Database, Network, Terminal, Atom, LayoutGrid, Code,
  TrendingUp, Target, BarChart2, Activity, BookOpen, CheckCircle
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PASS_COLORS = ['#10b981', '#ef4444'];

const Section = ({ title, icon, children, className = '', bodyClassName = 'p-6' }) => (
  <div className={`bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
      <span className="text-brand-600">{icon}</span>
      <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className={bodyClassName}>{children}</div>
  </div>
);

const Empty = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300 h-full">
    <span className="text-4xl">{icon}</span>
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

const techTracks = [
  {
    id: 'sde',
    title: 'SDE',
    registrations: '69091 Registrations',
    popular: false,
    icon: 'clipboard',
    iconColor: 'text-blue-600 bg-blue-50/50 border-blue-100',
    time: '50 Minutes',
    objective: 5,
    programming: 2,
    linkText: 'Event Ended >'
  },
  {
    id: 'sql',
    title: 'SQL',
    registrations: '16069 Registrations',
    popular: false,
    icon: 'database',
    iconColor: 'text-orange-600 bg-orange-50/50 border-orange-100',
    time: '30 Minutes',
    objective: 15,
    programming: 0,
    linkText: 'Event Ended >'
  },
  {
    id: 'ds',
    title: 'Data Structures',
    registrations: '11685 Registrations',
    popular: false,
    icon: 'network',
    iconColor: 'text-rose-600 bg-rose-50/50 border-rose-100',
    time: '30 Minutes',
    objective: 15,
    programming: 0,
    linkText: 'Event Ended >'
  },
  {
    id: 'python',
    title: 'Python',
    registrations: '12218 Registrations',
    popular: false,
    icon: 'terminal',
    iconColor: 'text-yellow-600 bg-yellow-50/50 border-yellow-100',
    time: '30 Minutes',
    objective: 5,
    programming: 2,
    linkText: 'Event Ended >'
  },
  {
    id: 'dsml',
    title: 'DSML',
    popular: true,
    registrations: null,
    icon: 'atom',
    iconColor: 'text-cyan-600 bg-cyan-50/50 border-cyan-100',
    time: '30 Minutes',
    objective: 10,
    programming: 0,
    linkText: 'Event Ended >'
  }
];

const StudentDashboardView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Widget rankings states
  const [topThree, setTopThree] = useState([]);
  const [studentRank, setStudentRank] = useState(933000);
  const [studentPoints, setStudentPoints] = useState(10000);

  // Modal rankings states
  const [showFullBoard, setShowFullBoard] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [viewMode, setViewMode] = useState('default'); // 'default' | 'explore_mocks' | 'progress'
  const [mockAssessments, setMockAssessments] = useState([]);
  const [searchMockQuery, setSearchMockQuery] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'explore_mocks') {
      setViewMode('explore_mocks');
    } else if (tab === 'progress') {
      setViewMode('progress');
    } else {
      setViewMode('default');
    }
  }, [location]);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      const timestamp = Date.now();

      // 1. Fetch active assessments
      try {
        const assessmentsRes = await api.get(`/assessments?t=${timestamp}`);
        if (assessmentsRes.data?.status === 'success') {
          setAssessments(assessmentsRes.data.data.assessments || []);
        }
      } catch (err) {
        console.warn('Failed to load assessments:', err);
      }

      // 2. Fetch student's attempt records
      try {
        const attemptsRes = await api.get(`/attempts/my-attempts?t=${timestamp}`);
        console.log('--- FETCH MY ATTEMPTS RESPONSE ---', attemptsRes.data);
        if (attemptsRes.data?.status === 'success') {
          setMyAttempts(attemptsRes.data.data.attempts || []);
        }
      } catch (err) {
        console.warn('Failed to load attempt records:', err);
      }

      // 3. Fetch top 3 global rankings
      try {
        const topRes = await api.get(`/leaderboard/global?limit=3&t=${timestamp}`);
        if (topRes.data?.status === 'success') {
          setTopThree(topRes.data.data.rankings || []);
        }
      } catch (err) {
        console.warn('Failed to load leaderboard rankings:', err);
      }

      // 4. Fetch student's own standing summary and analytics
      if (user) {
        try {
          const profileRes = await api.get(`/users/profile/${user._id}?t=${timestamp}`);
          if (profileRes.data?.status === 'success') {
            setStudentRank(profileRes.data.data.summary?.globalRank || 933000);
            setStudentPoints(profileRes.data.data.summary?.totalPoints || 10000);
            setSubjectPerformance(profileRes.data.data.subjectPerformance || []);
          }
          const analyticsRes = await api.get(`/users/profile/${user._id}/analytics?t=${timestamp}`);
          if (analyticsRes.data?.status === 'success') {
            setAnalytics(analyticsRes.data.data);
          }
        } catch (err) {
          console.warn('Failed to load student profile standing:', err);
        }
      }
      
      // 5. Fetch mock assessments
      try {
        const mocksRes = await api.get(`/assessments?isMock=true&t=${timestamp}`);
        if (mocksRes.data?.status === 'success') {
          setMockAssessments(mocksRes.data.data.assessments || []);
        }
      } catch (err) {
        console.warn('Failed to load mock assessments:', err);
      }

      setLoading(false);
    };
    fetchStudentData();
  }, [user, refreshTrigger]);

  // Fetch subjects list for modal filter
  useEffect(() => {
    if (!showFullBoard) return;
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.data?.status === 'success') {
          setSubjects(res.data.data.subjects || []);
        }
      } catch (err) {
        console.warn('Failed to load subjects list');
      }
    };
    fetchSubjects();
  }, [showFullBoard]);

  // Fetch full rankings for modal
  const fetchRankings = async () => {
    if (!showFullBoard) return;
    setModalLoading(true);
    let fetchedRankings = [];
    let fetchedTotalPages = 1;
    try {
      const params = {
        page,
        limit: 8,
        sortBy,
      };
      if (search) params.search = search;
      if (subject) params.subject = subject;

      const res = await api.get('/leaderboard/global', { params });
      if (res.data?.status === 'success') {
        fetchedRankings = res.data.data.rankings || [];
        fetchedTotalPages = res.data.totalPages || 1;
      }
    } catch (err) {
      console.warn('Failed to load global standings');
    } finally {
      setRankings(fetchedRankings);
      setTotalPages(fetchedTotalPages);
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [showFullBoard, page, subject, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRankings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSubject('');
    setSortBy('score');
    setPage(1);
  };

  const handleStartExam = (assessmentId) => {
    navigate(`/lobby/${assessmentId}`);
  };

  const getAttemptForAssessment = (assessmentId) => {
    return myAttempts.find((a) => a.assessment?._id === assessmentId);
  };

  const handleDashboardSubmit = async (attemptId) => {
    if (!window.confirm('Are you sure you want to submit this assessment? You cannot make any more changes.')) {
      return;
    }
    try {
      const res = await api.post(`/attempts/${attemptId}/submit`);
      if (res.data?.status === 'success') {
        alert('Assessment submitted successfully!');
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit assessment.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-slate-400 gap-2">
        <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
        Loading dashboard details...
      </div>
    );
  }

  const renderExploreMocksView = () => {
    // Registrations and visual badge mapping
    const getMockDetails = (title) => {
      const details = {
        'SDE': { reg: '69092 Registrations', time: '50 Minutes', obj: 5, prog: 2 },
        'React': { reg: '2284 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Java': { reg: '6682 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'SQL': { reg: '16070 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'AngularJS': { reg: null, time: '30 Minutes', obj: 15, prog: 0 },
        'Javascript': { reg: '4629 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'C++': { reg: '2429 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'HTML': { reg: '4378 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'OOPs': { reg: '3373 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Data Structures': { reg: '11685 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Python': { reg: '12220 Registrations', time: '30 Minutes', obj: 5, prog: 2 },
        'Node.js': { reg: '759 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'AWS': { reg: '1243 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Software Testing': { reg: '1817 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'DBMS-': { reg: '1754 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'REST API': { reg: '581 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'C#': { reg: '795 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Java 8': { reg: '1965 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'OS': { reg: '963 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'C': { reg: '2441 Registrations', time: '30 Minutes', obj: 5, prog: 2 },
        'Networking': { reg: '1519 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Spring Boot': { reg: '957 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Data Science': { reg: '727 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Machine Learning': { reg: '940 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Cloud Computing': { reg: '503 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'CSS': { reg: '1469 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
        'Android': { reg: null, time: '30 Minutes', obj: 15, prog: 0 },
        'DSML': { reg: null, time: '30 Minutes', obj: 10, prog: 0, popular: true },
        'PHP': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Data Analyst': { reg: null, time: '60 Minutes', obj: 15, prog: 0 },
        'Agile': { reg: null, time: '60 Minutes', obj: 15, prog: 0 },
        'Linux': { reg: '596 Registrations', time: '60 Minutes', obj: 15, prog: 0 },
        'iOS': { reg: null, time: '60 Minutes', obj: 15, prog: 0 },
        'MySQL': { reg: '745 Registrations', time: '60 Minutes', obj: 15, prog: 0 },
        'Microservices': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Kotlin': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'PL/SQL': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'GIT': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Django': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Multithreading': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'React Native': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'MongoDB': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Java Collections': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Jquery': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Angular 8': { reg: null, time: '60 Minutes', obj: 5, prog: 2 },
        'Uber': { reg: null, time: '45 Minutes', obj: 5, prog: 2 },
        'Linkedin': { reg: null, time: '45 Minutes', obj: 5, prog: 2 },
        'Infosys': { reg: '582 Registrations', time: '45 Minutes', obj: 5, prog: 2 },
        'MindTree': { reg: null, time: '45 Minutes', obj: 5, prog: 2 }
      };
      return details[title] || { reg: null, time: '45 Minutes', obj: 10, prog: 0 };
    };

    const getMockIcon = (title) => {
      const name = title.toLowerCase();
      if (name.includes('sde') || name.includes('testing') || name.includes('agile') || name.includes('git')) {
        return <ClipboardList size={22} className="text-blue-600" />;
      }
      if (name.includes('react') || name.includes('angular') || name.includes('atom')) {
        return <Atom size={22} className="text-cyan-600" />;
      }
      if (name.includes('python') || name.includes('node') || name.includes('php') || name.includes('django') || name.includes('kotlin') || name.includes('linux') || name.includes('ios')) {
        return <Terminal size={22} className="text-yellow-600" />;
      }
      if (name.includes('sql') || name.includes('dbms') || name.includes('mongo')) {
        return <Database size={22} className="text-orange-600" />;
      }
      if (name.includes('data structure') || name.includes('network') || name.includes('cloud') || name.includes('microservice') || name.includes('api')) {
        return <Network size={22} className="text-rose-600" />;
      }
      if (name.includes('dsml') || name.includes('science') || name.includes('machine') || name.includes('analyst') || name.includes('aws')) {
        return <Award size={22} className="text-purple-600" />;
      }
      return <Code size={22} className="text-slate-600" />;
    };

    const filteredMocks = mockAssessments.filter(m =>
      m.title.toLowerCase().includes(searchMockQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Explore All Mock Assessments</h1>
            <p className="text-xs text-slate-500 mt-1">Practice and prepare with our library of mock tests categorized by technologies.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            &larr; Back to Dashboard
          </Button>
        </div>

        {/* Search bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={searchMockQuery}
            onChange={(e) => setSearchMockQuery(e.target.value)}
            placeholder="Search mock assessments..."
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Grid of mock cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredMocks.map((mock) => {
            const details = getMockDetails(mock.title);
            return (
              <div
                key={mock._id}
                className={`relative bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                  details.popular ? 'border-cyan-400/85 ring-1 ring-cyan-400/20' : 'border-slate-200/80'
                }`}
              >
                {/* Registrations/Popular Badge */}
                <div className="absolute -top-2.5 right-2 z-10 flex">
                  {details.popular && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-1 shadow-sm">
                      ⭐ Popular
                    </span>
                  )}
                  {details.reg && (
                    <span className="bg-red-50 text-red-600 border border-red-200/60 px-2 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-1 shadow-sm">
                      🔥 {details.reg}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm bg-slate-50">
                    {getMockIcon(mock.title)}
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{mock.title}</h4>
                  </div>

                  {/* Specs */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Clock size={12} className="text-slate-400" />
                      <span>Time: {details.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <LayoutGrid size={12} className="text-slate-400" />
                      <span>Objective: {details.obj}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Code size={12} className="text-slate-400" />
                      <span>Programming: {details.prog}</span>
                    </div>
                  </div>
                </div>

                {/* Attempt Action */}
                <div className="border-t border-slate-100 pt-3 mt-4 text-center">
                  <button
                    onClick={() => handleStartExam(mock._id)}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-micro"
                  >
                    Attempt Now &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProgressView = () => {
    if (!analytics) return <div className="text-center py-10">Loading analytics...</div>;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Progress</h1>
            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of your analytics and assessment history.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            &larr; Back to Dashboard
          </Button>
        </div>
        
        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Trend */}
            {analytics?.scoreTrend?.length > 0 && (
              <Section title="Score Trend (Last 7 Tests)" icon={<TrendingUp size={16} />}>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.scoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="test" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}

            {/* Pass/Fail Ratio */}
            {analytics?.passFailRatio?.length > 0 && (
              <Section title="Pass / Fail Ratio" icon={<ShieldCheck size={16} />}>
                <div className="h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.passFailRatio} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                        {analytics.passFailRatio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Passed' ? PASS_COLORS[0] : PASS_COLORS[1]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend below */}
                  <div className="absolute bottom-2 flex gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Passed: {analytics.passFailRatio[0]?.value || 0}</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Failed: {analytics.passFailRatio[1]?.value || 0}</div>
                  </div>
                </div>
              </Section>
            )}

            {/* Monthly Averages */}
            {analytics?.monthlyAverages?.length > 0 && (
              <Section title="Monthly Averages" icon={<BarChart2 size={16} />}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyAverages} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}

            {/* Skill Analysis Radar */}
            {analytics?.skillAnalysis?.length > 0 && (
              <Section title="Skill Analysis" icon={<Target size={16} />}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }} cx="50%" cy="50%" outerRadius={95} data={analytics.skillAnalysis}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}
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
                  <Bar dataKey="student" name={user?.name || "Student"} fill="#6366f1" radius={[4, 4, 0, 0]} />
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
              <div className="space-y-5">
                {subjectPerformance.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-slate-700">{s.subjectName} <span className="text-slate-400 font-normal">({s.subjectCode})</span></span>
                      <span className="text-xs font-black text-brand-600">{s.averageScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                      <div className="bg-gradient-to-r from-brand-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${s.averageScore}%` }} />
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
      </div>
    );
  };

  if (viewMode === 'explore_mocks') {
    return renderExploreMocksView();
  }
  if (viewMode === 'progress') {
    return renderProgressView();
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-tr from-brand-600 to-brand-500 text-white p-5 border-none">
          <Award size={32} className="opacity-90" />
          <div className="mt-4">
            <span className="text-brand-100 text-xs font-medium uppercase tracking-wider">LMS Achievements</span>
            <h4 className="text-xl font-black mt-1">Practice Regularly</h4>
            <p className="text-xs text-brand-100 mt-2">Earn Gold and Silver solver badges by scoring 80%+ on coding and MCQ tasks.</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <Calendar className="text-blue-500" size={24} />
          <div className="mt-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Tests Assigned</span>
            <p className="text-2xl font-black text-slate-800">{assessments.length} Available</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <ShieldCheck className="text-emerald-500" size={24} />
          <div className="mt-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Tests Submitted</span>
            <p className="text-2xl font-black text-slate-800">
              {myAttempts.filter((a) => a.status === 'graded' || a.status === 'submitted').length} Exams
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid Layout split into Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Assigned Assessments and Submission Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Assessments list */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Assigned Assessments</h2>
            {assessments.length === 0 ? (
              <Card className="text-center py-10 text-slate-400 text-sm">
                No active assessments currently scheduled. Enjoy your break!
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assessments.map((test) => {
                  const attempt = getAttemptForAssessment(test._id);
                  const isStarted = attempt?.status === 'started';
                  const isLocked = attempt?.status === 'submitted' || attempt?.status === 'graded';

                  return (
                    <Card
                      key={test._id}
                      title={test.title}
                      subtitle={`${test.subject?.name} (${test.subject?.code})`}
                      extra={
                        <span className="inline-block px-2.5 py-1 rounded bg-brand-50 text-brand-600 text-xs font-bold capitalize">
                          {test.type}
                        </span>
                      }
                      className="hover:scale-[1.01]"
                    >
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {test.description || 'No detailed instructions configured.'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={14} /> {test.duration} min limits
                        </span>
                        <span className="font-semibold text-slate-500">
                          Total: {test.totalMarks} marks
                        </span>
                      </div>

                      <div className="mt-4 pt-2">
                        {isLocked ? (
                          <Button variant="secondary" className="w-full" disabled>
                            Completed & Submitted
                          </Button>
                        ) : isStarted ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="primary"
                              className="w-full bg-amber-500 hover:bg-amber-600 gap-2 font-bold transition-all"
                              onClick={() => navigate(`/assessment/${attempt._id}`)}
                            >
                              <RotateCcw size={16} /> Resume Active Attempt
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2 font-bold transition-all"
                              onClick={() => handleDashboardSubmit(attempt._id)}
                            >
                              <ShieldCheck size={16} /> Submit Assessment
                            </Button>
                          </div>
                        ) : (
                          <Button variant="primary" className="w-full gap-2" onClick={() => handleStartExam(test._id)}>
                            <Play size={16} /> Enter Lobby
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>



        </div>

        {/* Right column: Leaderboard Widget */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Rankings</h2>
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-5 flex flex-col justify-between">
            <div>
              {/* Header Title & Info Icon */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-sky-600 uppercase tracking-widest font-sans">Leaderboard</span>
                <button
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Rankings are updated dynamically based on total score points."
                >
                  <span className="w-4.5 h-4.5 rounded-full border border-slate-300 text-[10px] text-slate-500 font-bold flex items-center justify-center font-mono">
                    i
                  </span>
                </button>
              </div>
              <hr className="border-slate-100 mb-4" />

              {/* Top 3 Standings */}
              <div className="space-y-4">
                {topThree.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 w-6">#{idx + 1}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-black font-mono text-[9px] flex-shrink-0">
                        {item.student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span className="font-bold text-slate-700 truncate">
                        {item.student?.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 font-mono flex-shrink-0">
                      {item.totalScore}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Logged in student's current position */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 w-14">#{studentRank || '—'}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-black font-mono text-[9px] flex-shrink-0">
                    {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'RS'}
                  </div>
                  <span className="font-bold text-slate-700 truncate">{user?.name}</span>
                </div>
                <span className="font-bold text-slate-700 font-mono flex-shrink-0">
                  {studentPoints}
                </span>
              </div>
            </div>

            {/* Bottom Modal Trigger */}
            <div className="border-t border-slate-100 pt-4 mt-5 text-center">
              <button
                onClick={() => setShowFullBoard(true)}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1 transition-colors"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completed attempts / Scorecards download (Spans Full Width!) */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Submission Status</h2>
        <Card bodyClassName="p-0">
          {myAttempts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">You haven't attempted any tests yet.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Assessment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Time Spent</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {myAttempts.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                        {att.assessment?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold capitalize ${
                          att.status === 'graded' ? 'bg-emerald-50 text-accent-success' :
                          att.status === 'submitted' ? 'bg-amber-50 text-accent-warning' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {Math.round((att.timeTakenSeconds || 0) / 60)} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                        {att.status === 'graded' ? `${att.totalMarksObtained} pts` : 'Pending Grade'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {att.status === 'graded' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedScorecard(att)}
                          >
                            Download Scorecard
                          </Button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Looking to prepare for a specific technology? */}
      <div className="pt-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Looking to prepare for a specific technology?
          </h3>
          <p className="text-xs text-slate-400 mt-1">Refine your skills with mock tests categorized by languages and platforms</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {techTracks.map((track) => (
            <div
              key={track.id}
              className={`relative bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                track.popular ? 'border-cyan-400/85 ring-1 ring-cyan-400/20' : 'border-slate-200/80'
              }`}
            >
              {/* Badge tags */}
              <div className="absolute -top-2.5 right-2 z-10 flex">
                {track.popular && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-1 shadow-sm">
                    ⭐ Popular
                  </span>
                )}
                {track.registrations && (
                  <span className="bg-red-50 text-red-600 border border-red-200/60 px-2 py-0.5 rounded-full text-[8px] font-extrabold flex items-center gap-1 shadow-sm">
                    🔥 {track.registrations}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {/* Icon container */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${track.iconColor}`}>
                  {track.icon === 'clipboard' && <ClipboardList size={18} />}
                  {track.icon === 'database' && <Database size={18} />}
                  {track.icon === 'network' && <Network size={18} />}
                  {track.icon === 'terminal' && <Terminal size={18} />}
                  {track.icon === 'atom' && <Atom size={18} />}
                </div>

                {/* Title */}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{track.title}</h4>
                </div>

                {/* Meta Specifications */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Clock size={12} className="text-slate-400" />
                    <span>Time: {track.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <LayoutGrid size={12} className="text-slate-400" />
                    <span>Objective: {track.objective}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Code size={12} className="text-slate-400" />
                    <span>Programming: {track.programming}</span>
                  </div>
                </div>
              </div>

              {/* Bottom link */}
              <div className="border-t border-slate-100 pt-3 mt-4 text-center">
                <button
                  onClick={() => alert(`Starting preparation track for ${track.title}...`)}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-micro"
                >
                  {track.linkText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard?tab=explore_mocks')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            Explore All Mocks
          </button>
        </div>
      </div>

      {/* Full Leaderboard Modal Popup */}
      {showFullBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-100 animate-in fade-in-50 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">Global Standings</h3>
                <p className="text-xs text-slate-400">View real-time rankings across all subjects and exams</p>
              </div>
              <button
                onClick={() => setShowFullBoard(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Filters Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] flex gap-2">
                <input
                  type="text"
                  placeholder="Search by student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Button type="submit" size="sm">Search</Button>
              </form>

              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="score">Sort by Points</option>
                <option value="percentage">Sort by Avg %</option>
                <option value="attempts">Sort by Completed</option>
              </select>

              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>

            {/* Modal Content - Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading ? (
                <div className="flex justify-center items-center py-16 text-slate-400 gap-2">
                  <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
                  Loading global rankings...
                </div>
              ) : rankings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">No students match your query.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold text-slate-400 uppercase">Rank</th>
                        <th className="px-4 py-2 text-left font-bold text-slate-400 uppercase">Student Name</th>
                        <th className="px-4 py-2 text-left font-bold text-slate-400 uppercase">Points</th>
                        <th className="px-4 py-2 text-left font-bold text-slate-400 uppercase">Exams Completed</th>
                        <th className="px-4 py-2 text-left font-bold text-slate-400 uppercase">Avg %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {rankings.map((row) => (
                        <tr key={row._id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[11px] ${
                              row.rank === 1 ? 'bg-amber-100 text-amber-800' :
                              row.rank === 2 ? 'bg-slate-100 text-slate-700' :
                              row.rank === 3 ? 'bg-orange-100 text-orange-800' :
                              'text-slate-400'
                            }`}>
                              {row.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-700">
                            {row.student?.name}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              ({row.student?.batch || 'Regular'})
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-800">
                            {row.totalScore} pts
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            {row.assessmentsCompleted}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-600">
                            {row.avgPercentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer - Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 rounded-b-2xl">
              <span className="text-slate-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Printable Scorecard Modal */}
      {selectedScorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col border border-slate-100 animate-in fade-in-50 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 font-sans">Student Assessment Scorecard</h3>
              <button
                onClick={() => setSelectedScorecard(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Scorecard Printable Area */}
            <div id="scorecard-print-area" className="p-8 space-y-6 overflow-y-auto flex-1">
              {/* Institution Title */}
              <div className="text-center pb-6 border-b-2 border-slate-100">
                <h1 className="text-2xl font-black tracking-tight text-slate-950">LMS ASSESSMENT PORTAL</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Student Performance Scorecard</p>
              </div>

              {/* Student and Assessment Meta Specifications */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px] mb-1">Student Details</span>
                  <p className="font-extrabold text-slate-800 text-sm">{user?.name}</p>
                  <p className="text-slate-500 font-medium mt-0.5">{user?.email}</p>
                  <p className="text-slate-500 capitalize font-medium">{user?.role} Profile</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block uppercase text-[9px] mb-1">Assessment Specifications</span>
                  <p className="font-extrabold text-slate-800 text-sm">{selectedScorecard.assessment?.title}</p>
                  <p className="text-slate-500 font-medium mt-0.5">{selectedScorecard.assessment?.subject?.name} ({selectedScorecard.assessment?.subject?.code})</p>
                  <p className="text-slate-400 font-bold text-[9px] mt-1 uppercase">
                    SUBMITTED: {new Date(selectedScorecard.submittedAt || selectedScorecard.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Performance Indicator Grid */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="text-center border-r border-slate-200">
                  <span className="text-slate-550 text-[9px] font-bold uppercase tracking-wider block">Score Obtained</span>
                  <p className="text-2xl font-black text-slate-805 mt-1">{selectedScorecard.totalMarksObtained} pts</p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">out of {selectedScorecard.assessment?.totalMarks} max</span>
                </div>
                <div className="text-center border-r border-slate-200">
                  <span className="text-slate-550 text-[9px] font-bold uppercase tracking-wider block">Percentage Score</span>
                  <p className="text-2xl font-black text-slate-805 mt-1">
                    {Math.round((selectedScorecard.totalMarksObtained / (selectedScorecard.assessment?.totalMarks || 1)) * 100)}%
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Passing bar: {selectedScorecard.assessment?.passingScore || 0} pts</span>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="text-slate-555 text-[9px] font-bold uppercase tracking-wider block mb-1">Attempt Outcome</span>
                  {selectedScorecard.isPassed ? (
                    <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase tracking-wider">
                      PASS
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-red-100 text-red-800 text-xs font-black rounded-full uppercase tracking-wider">
                      FAIL
                    </span>
                  )}
                </div>
              </div>

              {/* Question Level Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Question Level Graded Log</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Q#</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase">Type</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase">Marks</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedScorecard.answers?.map((ans, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 font-bold text-slate-600">#{idx + 1}</td>
                          <td className="px-4 py-2.5 text-slate-500 capitalize">
                            {ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex !== null ? 'MCQ Question' : ans.submittedCode ? 'Coding Sandbox' : 'Theory Essay'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-700">{ans.marksObtained} pts</td>
                          <td className="px-4 py-2.5 text-center">
                            {ans.marksObtained > 0 ? (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Correct"></span>
                            ) : (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title="Incorrect / Pending"></span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Authenticity Certificate Stamp */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Verification ID: {selectedScorecard._id}</span>
                <span className="italic">Computer Generated Official Transcript. No Signature Required.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedScorecard(null);
                  navigate(`/assessment/${selectedScorecard._id}`);
                }}
              >
                Review Full Answers
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedScorecard(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={() => {
                  const content = document.getElementById('scorecard-print-area');
                  if (!content) return;
                  const printWindow = window.open('', '_blank', 'width=800,height=600');
                  printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Scorecard - ${selectedScorecard.assessment?.title || 'Assessment'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 40px; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #020617; }
  .subtitle { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; font-size: 12px; }
  .meta-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px; }
  .meta-name { font-size: 14px; font-weight: 800; color: #1e293b; }
  .meta-sub { color: #64748b; font-weight: 500; margin-top: 2px; }
  .meta-date { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
  .perf-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin-top: 24px; }
  .perf-cell { text-align: center; }
  .perf-cell:not(:last-child) { border-right: 1px solid #e2e8f0; }
  .perf-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .perf-value { font-size: 22px; font-weight: 900; color: #1e293b; margin-top: 4px; }
  .perf-sub { font-size: 10px; color: #94a3b8; font-weight: 600; margin-top: 2px; }
  .badge-pass { display: inline-block; padding: 4px 16px; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 900; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; }
  .badge-fail { display: inline-block; padding: 4px 16px; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 900; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; }
  .section-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 2px; margin-top: 24px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; }
  th { background: #f8fafc; padding: 8px 16px; text-align: left; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
  th.right { text-align: right; }
  th.center { text-align: center; }
  td { padding: 8px 16px; border-top: 1px solid #f1f5f9; }
  td.right { text-align: right; font-weight: 700; color: #334155; }
  td.center { text-align: center; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
  .dot-green { background: #10b981; }
  .dot-red { background: #ef4444; }
  .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  .divider { border: none; border-top: 2px solid #f1f5f9; margin: 24px 0; }
</style></head><body>
  <div class="text-center">
    <h1>LMS ASSESSMENT PORTAL</h1>
    <p class="subtitle">Official Student Performance Scorecard</p>
  </div>
  <hr class="divider">
  <div class="meta-grid">
    <div>
      <span class="meta-label">Student Details</span>
      <p class="meta-name">${user?.name || ''}</p>
      <p class="meta-sub">${user?.email || ''}</p>
      <p class="meta-sub" style="text-transform:capitalize">${user?.role || ''} Profile</p>
    </div>
    <div class="text-right">
      <span class="meta-label">Assessment Specifications</span>
      <p class="meta-name">${selectedScorecard.assessment?.title || ''}</p>
      <p class="meta-sub">${selectedScorecard.assessment?.subject?.name || ''} (${selectedScorecard.assessment?.subject?.code || ''})</p>
      <p class="meta-date">SUBMITTED: ${new Date(selectedScorecard.submittedAt || selectedScorecard.createdAt).toLocaleString()}</p>
    </div>
  </div>
  <div class="perf-grid">
    <div class="perf-cell">
      <span class="perf-label">Score Obtained</span>
      <p class="perf-value">${selectedScorecard.totalMarksObtained} pts</p>
      <p class="perf-sub">out of ${selectedScorecard.assessment?.totalMarks || 0} max</p>
    </div>
    <div class="perf-cell">
      <span class="perf-label">Percentage Score</span>
      <p class="perf-value">${Math.round((selectedScorecard.totalMarksObtained / (selectedScorecard.assessment?.totalMarks || 1)) * 100)}%</p>
      <p class="perf-sub">Passing bar: ${selectedScorecard.assessment?.passingScore || 0} pts</p>
    </div>
    <div class="perf-cell">
      <span class="perf-label">Attempt Outcome</span>
      <p style="margin-top:8px"><span class="${selectedScorecard.isPassed ? 'badge-pass' : 'badge-fail'}">${selectedScorecard.isPassed ? 'PASS' : 'FAIL'}</span></p>
    </div>
  </div>
  <p class="section-title">Question Level Graded Log</p>
  <table>
    <thead><tr><th>Q#</th><th>Type</th><th class="right">Marks</th><th class="center">Status</th></tr></thead>
    <tbody>${(selectedScorecard.answers || []).map((ans, idx) => `<tr>
      <td style="font-weight:700;color:#475569">#${idx + 1}</td>
      <td style="color:#64748b">${ans.selectedOptionIndex !== undefined && ans.selectedOptionIndex !== null ? 'MCQ Question' : ans.submittedCode ? 'Coding Sandbox' : 'Theory Essay'}</td>
      <td class="right">${ans.marksObtained} pts</td>
      <td class="center"><span class="dot ${ans.marksObtained > 0 ? 'dot-green' : 'dot-red'}"></span></td>
    </tr>`).join('')}</tbody>
  </table>
  <div class="footer">
    <span>Verification ID: ${selectedScorecard._id}</span>
    <span style="font-style:italic">Computer Generated Official Transcript. No Signature Required.</span>
  </div>
</body></html>`);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => { printWindow.print(); }, 300);
                }}>
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDashboardView;

