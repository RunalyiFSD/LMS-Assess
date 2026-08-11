import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ProgressAnalyticsView from './ProgressAnalyticsView';
import PerformanceReport from './PerformanceReport';
import { DashboardSkeleton } from '../common/Skeleton';
import {
  Award,
  Calendar,
  ShieldCheck,
  PieChart as PieChartIcon,
  ArrowRight,
  Code,
  BookOpen,
  CheckSquare,
  Clock,
  Download,
  MoreVertical,
  Trophy,
  ChevronRight,
  ClipboardList,
  Database,
  Network,
  Terminal,
  Atom,
  ChevronDown,
  LayoutGrid,
  Building2,
  Code2,
  CheckCircle,
  X,
  Target,
  BarChart2,
  Briefcase,
  Compass
} from 'lucide-react';

const StudentDashboardView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [assessments, setAssessments] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('default');
  const [analytics, setAnalytics] = useState(null);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('This Month');
  const [selectedMockCategory, setSelectedMockCategory] = useState(null);
  const [startingCardId, setStartingCardId] = useState(null);
  const [leaderboardList, setLeaderboardList] = useState([]);

  // Sync viewMode with URL params
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

  // Fetch assessments, attempts, and student profile data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const t = Date.now();

      try {
        const [assignedRes, assessRes, attemptsRes, leaderboardRes] = await Promise.all([
          api.get(`/assessments/assigned-to-me?t=${t}`).catch(() => null),
          api.get(`/assessments?t=${t}`).catch(() => ({ data: { data: { assessments: [] } } })),
          api.get(`/attempts/my-attempts?t=${t}`).catch(() => ({ data: { data: { attempts: [] } } })),
          api.get(`/leaderboard/top-five?t=${t}`).catch(() => null),
        ]);

        const assignedList = assignedRes?.data?.data?.assessments || [];

        // Focus strictly on assessments assigned by instructors
        const recentAssigned = [...assignedList];

        // Sort by creation / assigned date descending (newest first)
        recentAssigned.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setAssessments(recentAssigned);

        if (attemptsRes.data?.status === 'success') {
          setMyAttempts(attemptsRes.data.data.attempts || []);
        }

        if (leaderboardRes?.data?.status === 'success' && leaderboardRes.data.data?.rankings) {
          const ranks = leaderboardRes.data.data.rankings;
          const rankBgs = ['bg-amber-400 text-white', 'bg-slate-300 text-slate-700', 'bg-amber-600 text-white', 'bg-slate-800 text-white', 'bg-slate-800 text-white'];
          const rankBadges = ['🥇', '🥈', '🥉', '', ''];

          const mappedLeaderboard = ranks.map((item, idx) => {
            const isMe = (user?._id && String(item.studentId) === String(user._id)) || (item.name && item.name.toLowerCase() === user?.name?.toLowerCase());
            return {
              rank: item.rank || idx + 1,
              name: isMe ? `${item.name} (You)` : item.name,
              score: `${item.totalScore || 0} pts`,
              points: item.totalScore || 0,
              badge: rankBadges[idx] || '',
              isCurrentUser: isMe,
              rankBg: rankBgs[idx] || 'bg-slate-800 text-white',
            };
          });
          setLeaderboardList(mappedLeaderboard);
        }

        if (user?._id) {
          const analyticsRes = await api.get(`/users/profile/${user._id}/analytics?t=${t}`).catch(() => null);
          if (analyticsRes?.data?.status === 'success') {
            setAnalytics(analyticsRes.data.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Compute dynamic submission list based strictly on real backend attempts / evaluation
  const dynamicSubmissions = React.useMemo(() => {
    const list = [];
    const processedAssessmentIds = new Set();

    // 1. Process all attempts in myAttempts (real database submissions)
    (myAttempts || []).forEach((att) => {
      const ast = att.assessment || {};
      const astId = ast._id || att.assessment;
      if (astId) processedAssessmentIds.add(String(astId));

      const title = ast.title || 'Assessment';
      const rawType = ast.type || 'mcq';
      const category = rawType === 'coding' ? 'Coding' : rawType === 'mcq' ? 'MCQ' : 'Theory';

      const icon =
        rawType === 'coding' ? (
          <Code size={16} className="text-indigo-600" />
        ) : rawType === 'mcq' ? (
          <CheckSquare size={16} className="text-emerald-600" />
        ) : (
          <BookOpen size={16} className="text-amber-600" />
        );

      const totalMarks = ast.totalMarks || 10;
      const scoreObtained = att.totalMarksObtained || 0;
      const percentage = totalMarks > 0 ? Math.round((scoreObtained / totalMarks) * 100) : 0;

      const minutesSpent = att.timeTakenSeconds ? Math.max(1, Math.round(att.timeTakenSeconds / 60)) : null;
      const timeSpentStr = minutesSpent !== null ? `${minutesSpent} min` : '--';

      let statusText = 'Not Attempted';
      let statusBadge = 'bg-slate-100 text-slate-500 border-slate-200';

      if (att.status === 'graded') {
        statusText = 'Graded';
        statusBadge = 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
      } else if (att.status === 'submitted') {
        statusText = 'Pending';
        statusBadge = 'bg-amber-50 text-amber-600 border-amber-200/60';
      } else if (att.status === 'started') {
        statusText = 'In Progress';
        statusBadge = 'bg-indigo-50 text-indigo-600 border-indigo-200/60';
      }

      list.push({
        id: att._id,
        attemptId: att._id,
        assessmentId: astId,
        title,
        category,
        icon,
        status: statusText,
        statusRaw: att.status,
        statusBadge,
        timeSpent: timeSpentStr,
        timeTakenMinutes: minutesSpent || 0,
        score: att.status === 'graded' ? `${percentage}%` : att.status === 'submitted' ? 'In Review' : '--',
        details: att.status === 'graded' ? `(${scoreObtained}/${totalMarks})` : '',
        scoreObtained,
        totalMarks,
        percentage,
        gradedAt: att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : new Date().toLocaleDateString(),
      });
    });

    // 2. Include assigned assessments that have not been attempted yet as "Not Attempted"
    (assessments || []).forEach((ast) => {
      if (ast._id && !processedAssessmentIds.has(String(ast._id))) {
        const title = ast.title || 'Assessment';
        const rawType = ast.type || 'mcq';
        const category = rawType === 'coding' ? 'Coding' : rawType === 'mcq' ? 'MCQ' : 'Theory';

        const icon =
          rawType === 'coding' ? (
            <Code size={16} className="text-indigo-600" />
          ) : rawType === 'mcq' ? (
            <CheckSquare size={16} className="text-emerald-600" />
          ) : (
            <BookOpen size={16} className="text-amber-600" />
          );

        list.push({
          id: `unatt_${ast._id}`,
          attemptId: null,
          assessmentId: ast._id,
          title,
          category,
          icon,
          status: 'Not Attempted',
          statusRaw: 'not_started',
          statusBadge: 'bg-slate-100 text-slate-500 border-slate-200',
          timeSpent: '--',
          timeTakenMinutes: 0,
          score: '--',
          details: '',
          scoreObtained: 0,
          totalMarks: ast.totalMarks || 10,
          percentage: 0,
          gradedAt: '--',
        });
      }
    });

    return list;
  }, [myAttempts, assessments]);

  // Tech Preparation Tracks (matches screenshot 2)
  const techTracks = [
    {
      id: 'sde',
      title: 'SDE',
      badge: '🔥 69091 Registrations',
      badgeType: 'fire',
      icon: <ClipboardList size={22} className="text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100',
      time: '50 Minutes',
      objective: 5,
      programming: 2,
    },
    {
      id: 'sql',
      title: 'SQL',
      badge: '🔥 16059 Registrations',
      badgeType: 'fire',
      icon: <Database size={22} className="text-orange-600" />,
      iconBg: 'bg-orange-50 border-orange-100',
      time: '30 Minutes',
      objective: 15,
      programming: 0,
    },
    {
      id: 'ds',
      title: 'Data Structures',
      badge: '🔥 11655 Registrations',
      badgeType: 'fire',
      icon: <Network size={22} className="text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-100',
      time: '30 Minutes',
      objective: 15,
      programming: 0,
    },
    {
      id: 'python',
      title: 'Python',
      badge: '🔥 12218 Registrations',
      badgeType: 'fire',
      icon: <Terminal size={22} className="text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      time: '30 Minutes',
      objective: 5,
      programming: 2,
    },
    {
      id: 'dsml',
      title: 'DSML',
      badge: '⭐ Popular',
      badgeType: 'star',
      icon: <Atom size={22} className="text-cyan-600" />,
      iconBg: 'bg-cyan-50 border-cyan-100',
      time: '30 Minutes',
      objective: 10,
      programming: 0,
    },
  ];

  const handleStartTest = async (testId, mockItem) => {
    // Company mock cards — create a real assessment via backend, then navigate
    if (typeof testId === 'string' && testId.startsWith('cmp_')) {
      setStartingCardId(testId);
      try {
        const companySlug = (mockItem?.companySlug || mockItem?.company || 'google').toLowerCase();
        const res = await api.post('/leetcode/create-mock', { companySlug });
        if (res.data?.data?.assessment?._id) {
          navigate(`/lobby/${res.data.data.assessment._id}`);
          return;
        }
      } catch (err) {
        console.warn('Failed to auto-create mock:', err);
      } finally {
        setStartingCardId(null);
      }
      // Fallback: go to company-mock page (never navigate to /lobby/cmp_X)
      navigate('/company-mock');
      return;
    }

    // Language / assigned mock cards
    if (typeof testId === 'string' && (testId.startsWith('lang_') || testId.startsWith('asgn_'))) {
      navigate('/company-mock');
      return;
    }

    // Real MongoDB ObjectId — go straight to lobby
    navigate(`/lobby/${testId}`);
  };

  const handleDownloadReport = (submission) => {
    if (!submission) return;
    setSelectedScorecard({
      studentName: user?.name || 'Student',
      college: user?.college || 'SPPU',
      department: user?.department || 'CS',
      assessmentTitle: submission.title || 'Assessment',
      scoreObtained: submission.scoreObtained ?? 0,
      totalMarks: submission.totalMarks ?? 10,
      timeTakenMinutes: submission.timeTakenMinutes || 0,
      percentage: submission.percentage ?? 0,
      gradedAt: submission.gradedAt || new Date().toLocaleDateString(),
    });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }
  const companyMocksList = [
    { _id: 'cmp_1', title: 'Infosys Placement Aptitude Mock', company: 'Infosys', reg: '582 Registrations', time: '45 Minutes', obj: 15, prog: 2 },
    { _id: 'cmp_2', title: 'Uber Engineering Aptitude Mock', company: 'Uber', reg: '1240 Registrations', time: '45 Minutes', obj: 15, prog: 2 },
    { _id: 'cmp_3', title: 'LinkedIn Tech Assessment Aptitude', company: 'LinkedIn', reg: '980 Registrations', time: '45 Minutes', obj: 15, prog: 2 },
    { _id: 'cmp_4', title: 'MindTree Placement Aptitude Mock', company: 'MindTree', reg: '450 Registrations', time: '45 Minutes', obj: 15, prog: 2 },
    { _id: 'cmp_5', title: 'TCS NQT Aptitude Simulation', company: 'TCS', reg: '3420 Registrations', time: '60 Minutes', obj: 20, prog: 2 },
    { _id: 'cmp_6', title: 'Amazon SDE Aptitude Screening', company: 'Amazon', reg: '4120 Registrations', time: '60 Minutes', obj: 15, prog: 2 }
  ];

  const languageMocksList = [
    { _id: 'lang_1', title: 'React.js Developer Mock', lang: 'React', reg: '2284 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
    { _id: 'lang_2', title: 'Java Core & OOPs Mock', lang: 'Java', reg: '6682 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
    { _id: 'lang_3', title: 'Python Programming Mock', lang: 'Python', reg: '12220 Registrations', time: '30 Minutes', obj: 5, prog: 2 },
    { _id: 'lang_4', title: 'SQL & Database Design', lang: 'SQL', reg: '16070 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
    { _id: 'lang_5', title: 'C++ Data Structures Mock', lang: 'C++', reg: '2429 Registrations', time: '30 Minutes', obj: 15, prog: 0 },
    { _id: 'lang_6', title: 'Node.js & Backend API', lang: 'Node.js', reg: '759 Registrations', time: '30 Minutes', obj: 15, prog: 0 }
  ];

  const renderExploreMocksView = () => {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Explore Mock Assessments</span>
              <span className="text-indigo-600 text-lg">✨</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Choose a category to practice and improve your skills with industry-standard mocks.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Feature Banner Strip (4 Highlights) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">Practice smart. Get better.</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Ace your next interview.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 pt-4 sm:pt-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">Real exam experience</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Industry-standard pattern</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 pt-4 sm:pt-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">Instant performance insights</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Track your progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 pt-4 sm:pt-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">Industry curated mocks</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Top companies & tech stacks</p>
            </div>
          </div>
        </div>

        {selectedMockCategory === null ? (
          /* Main 2 Cards: Company Aptitude & Tech Stack Mocks */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">

            {/* CARD 1: Company Aptitude Assessments */}
            <div
              onClick={() => setSelectedMockCategory('company')}
              className="bg-[#F8FAFC]/60 rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-5">
                {/* Top Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-100 shadow-2xs flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>COMPANY APTITUDE</span>
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Company Aptitude Assessments</h2>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Prepare for placement aptitude tests and screening rounds used by top companies.
                  </p>
                </div>

                {/* Content Row: Bullets Left + 3D Illustration Right */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
                  <div className="sm:col-span-8 space-y-2.5 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                        <CheckSquare size={13} />
                      </div>
                      <span>Tests from Infosys, TCS, Wipro, Accenture, Amazon & more</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                        <Clock size={13} />
                      </div>
                      <span>45–60 mins real exam time constraints</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                        <Target size={13} />
                      </div>
                      <span>Aptitude, Reasoning, Verbal & Quantitative</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                        <Code size={13} />
                      </div>
                      <span>Integrated sandbox for coding & problem solving</span>
                    </div>
                  </div>

                  {/* 3D Clipboard & Target Illustration SVG */}
                  <div className="sm:col-span-4 flex justify-center py-2 sm:py-0">
                    <div className="w-28 h-28 relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
                        {/* Board */}
                        <rect x="20" y="25" width="70" height="85" rx="12" fill="#818CF8" fillOpacity="0.2" />
                        <rect x="25" y="30" width="60" height="75" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
                        {/* Lines */}
                        <rect x="35" y="45" width="40" height="4" rx="2" fill="#818CF8" />
                        <rect x="35" y="55" width="30" height="4" rx="2" fill="#A5B4FC" />
                        <rect x="35" y="65" width="35" height="4" rx="2" fill="#A5B4FC" />
                        {/* Clip top */}
                        <rect x="42" y="22" width="26" height="12" rx="4" fill="#4F46E5" />
                        {/* Target Circle Overlay */}
                        <circle cx="85" cy="80" r="24" fill="#4F46E5" />
                        <circle cx="85" cy="80" r="17" fill="#EEF2FF" />
                        <circle cx="85" cy="80" r="10" fill="#4F46E5" />
                        <circle cx="85" cy="80" r="4" fill="#EEF2FF" />
                        {/* Arrow */}
                        <path d="M102 63 L87 78 L93 84 Z" fill="#312E81" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Explore Button */}
                <div className="pt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMockCategory('company'); }}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-3.5 rounded-2xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <span>Explore Company Aptitude</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Bottom Company Logos Bar */}
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto">
                  <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-slate-800 font-black text-xs shadow-2xs">
                    Infosys
                  </div>
                  <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-slate-800 font-black text-xs shadow-2xs flex items-center gap-1">
                    <span className="text-red-600 font-black">tcs</span>
                    <span className="text-[9px] text-slate-400 font-semibold">TATA</span>
                  </div>
                  <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-slate-800 font-black text-xs shadow-2xs">
                    wipro
                  </div>
                  <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-slate-800 font-black text-xs shadow-2xs">
                    accenture
                  </div>
                  <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-slate-800 font-black text-xs shadow-2xs">
                    amazon
                  </div>
                </div>

              </div>
            </div>

            {/* CARD 2: Language & Tech Stack Mocks */}
            <div
              onClick={() => setSelectedMockCategory('language')}
              className="bg-[#F8FAFC]/60 rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-5">
                {/* Top Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#00897B] text-white flex items-center justify-center shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
                    <Code2 size={24} />
                  </div>
                  <span className="bg-teal-50 text-teal-700 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-teal-100 shadow-2xs flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>TECHNOLOGY MOCKS</span>
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Language & Tech Stack Mocks</h2>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Strengthen your technical skills with language-specific quizzes and coding challenges.
                  </p>
                </div>

                {/* Content Row: Bullets Left + 3D Laptop Graphic Right */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
                  <div className="sm:col-span-8 space-y-2.5 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0">
                        <CheckCircle size={13} />
                      </div>
                      <span>Languages: C, C++, Java, Python, JavaScript & more</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0">
                        <Clock size={13} />
                      </div>
                      <span>30 mins focused language quizzes</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0">
                        <LayoutGrid size={13} />
                      </div>
                      <span>Data Structures, Algorithms & System Design</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0">
                        <Award size={13} />
                      </div>
                      <span>Instant analytics & detailed scorecard</span>
                    </div>
                  </div>

                  {/* 3D Laptop & Code Badge Graphic SVG */}
                  <div className="sm:col-span-4 flex justify-center py-2 sm:py-0">
                    <div className="w-28 h-28 relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
                        {/* Laptop Base */}
                        <path d="M15 90 L105 90 C108 90 110 92 108 95 L102 98 C100 100 98 100 95 100 L25 100 C22 100 20 100 18 98 L12 95 C10 92 12 90 15 90 Z" fill="#94A3B8" />
                        {/* Screen Frame */}
                        <rect x="25" y="25" width="70" height="65" rx="6" fill="#1E293B" />
                        <rect x="28" y="28" width="64" height="56" rx="4" fill="#0F172A" />
                        {/* Code Lines on Screen */}
                        <rect x="34" y="36" width="30" height="3" rx="1.5" fill="#38BDF8" />
                        <rect x="34" y="43" width="45" height="3" rx="1.5" fill="#34D399" />
                        <rect x="38" y="50" width="35" height="3" rx="1.5" fill="#F472B6" />
                        <rect x="38" y="57" width="25" height="3" rx="1.5" fill="#FBBF24" />
                        <rect x="34" y="64" width="40" height="3" rx="1.5" fill="#38BDF8" />
                        {/* Floating Code Badge */}
                        <rect x="80" y="55" width="28" height="24" rx="6" fill="#00897B" />
                        <path d="M87 67 L90 64 L87 61 M101 67 L98 64 L101 61" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Explore Button */}
                <div className="pt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMockCategory('language'); }}
                    className="w-full bg-[#00897B] hover:bg-[#00796B] text-white font-bold py-3.5 rounded-2xl shadow-md hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <span>Explore Technology Mocks</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Bottom Tech Logos Bar */}
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto">
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs shadow-2xs">
                    C
                  </div>
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-blue-700 font-black text-xs shadow-2xs">
                    C++
                  </div>
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-red-600 font-black text-xs shadow-2xs">
                    ☕
                  </div>
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 font-black text-xs shadow-2xs">
                    🐍
                  </div>
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-yellow-500 font-black text-xs shadow-2xs">
                    JS
                  </div>
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs shadow-2xs">
                    JS
                  </div>
                  <div className="bg-white border border-slate-200/80 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs shadow-2xs">
                    +
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Sub-category detail view */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl ${selectedMockCategory === 'company' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                  {selectedMockCategory === 'company' ? <Building2 size={24} /> : <Code2 size={24} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedMockCategory === 'company' ? 'Company Aptitude Assessments' : 'Language & Tech Stack Mocks'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedMockCategory === 'company' ? 'Placement aptitude tests for top hiring firms' : 'Language and stack specific practice drills'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMockCategory(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                &larr; Back to Categories
              </button>
            </div>

            {/* Company question cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(selectedMockCategory === 'company' ? companyMocksList : languageMocksList).map((mock) => {
                const isStarting = startingCardId === mock._id;

                return (
                  <div
                    key={mock._id}
                    className="bg-white rounded-3xl shadow-xs border border-slate-100 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
                  >
                    <div className="space-y-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs bg-slate-50 text-indigo-600">
                          {selectedMockCategory === 'company' ? <Building2 size={20} /> : <Code2 size={20} />}
                        </div>
                        {mock.reg && (
                          <span className="bg-red-50 text-red-600 border border-red-200/60 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold">
                            🔥 {mock.reg}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{mock.title}</h4>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={11} /> {mock.time}</span>
                        <span className="w-px h-3 bg-slate-200" />
                        <span className="flex items-center gap-1"><LayoutGrid size={11} /> {mock.obj} Obj</span>
                        <span className="w-px h-3 bg-slate-200" />
                        <span className="flex items-center gap-1"><Code size={11} /> {mock.prog} Prog</span>
                      </div>

                      {/* Question list — always visible */}
                      {mock.sampleQuestions && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sample Questions</span>
                          {mock.sampleQuestions.map((q, qIdx) => (
                            <div
                              key={qIdx}
                              className="flex items-start gap-2 p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 text-[11px]"
                            >
                              <span className="mt-0.5 w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                                {qIdx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 leading-tight truncate">{q.title}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-semibold text-slate-400">
                                  <span>{q.type}</span>
                                  <span className="w-px h-2.5 bg-slate-200" />
                                  <span className={q.difficulty === 'Easy' ? 'text-emerald-500' : 'text-amber-500'}>{q.difficulty}</span>
                                  <span className="w-px h-2.5 bg-slate-200" />
                                  <span className="text-indigo-500">{q.marks} pts</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="border-t border-slate-100 pt-4 mt-5 text-center">
                      <button
                        onClick={() => handleStartTest(mock._id, mock)}
                        disabled={isStarting}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isStarting ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            <span>Generating Exam...</span>
                          </span>
                        ) : (
                          <>
                            <span>Attempt Now</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (viewMode === 'explore_mocks') {
    return renderExploreMocksView();
  }

  if (viewMode === 'progress') {
    return <ProgressAnalyticsView analyticsData={analytics} userProfile={user} />;
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Report Modal */}
      {selectedScorecard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:bg-white print:p-0 print:static print:block">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-4 print:max-h-none print:shadow-none print:p-0 print:overflow-visible">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <span className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                🏆 Verified Assessment Certificate & Report
              </span>
              <button
                onClick={() => setSelectedScorecard(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <PerformanceReport scorecard={selectedScorecard} userProfile={user} onClose={() => setSelectedScorecard(null)} />
          </div>
        </div>
      )}

      {/* ── 1. TOP METRIC CARDS ROW (4 CARDS) ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">

        {/* Card 1: LMS ACHIEVEMENTS Banner */}
        <div className="bg-gradient-to-br from-[#4338CA] via-[#3730A3] to-[#312E81] text-white p-6 rounded-3xl relative overflow-hidden shadow-xs flex flex-col justify-between min-h-[160px]">
          <div className="space-y-1 z-10">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-3">
              <Award size={18} className="text-indigo-200" />
            </div>
            <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-widest block">
              LMS ACHIEVEMENTS
            </span>
            <h3 className="text-lg font-black text-white leading-tight">Practice Regularly</h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed pt-1">
              Earn Gold and Silver solver badges by scoring 80%+ on coding and MCQ tasks.
            </p>
          </div>

          <div className="pt-4 flex justify-end z-10">
            <button
              onClick={() => navigate('/dashboard?tab=progress')}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title="View Progress Analytics"
            >
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Decorative Sparkle Background SVGs */}
          <svg className="absolute top-3 right-6 opacity-30 w-16 h-16 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>

        {/* Card 2: TESTS ASSIGNED */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex items-center justify-between min-h-[160px]">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pt-2 block">
              TESTS ASSIGNED
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {assessments.length || 3}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400 block">Available</span>
          </div>

          {/* Sparkline Blue Graph */}
          <div className="w-24 h-12 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0 30 Q25 35 50 15 T100 10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 30 Q25 35 50 15 T100 10 L100 40 L0 40 Z"
                fill="url(#blue-grad)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 3: TESTS SUBMITTED */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex items-center justify-between min-h-[160px]">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pt-2 block">
              TESTS SUBMITTED
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {myAttempts.length || 3}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400 block">Exams</span>
          </div>

          {/* Sparkline Green Graph */}
          <div className="w-24 h-12 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0 35 Q25 20 50 30 T100 15"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 35 Q25 20 50 30 T100 15 L100 40 L0 40 Z"
                fill="url(#green-grad)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 4: AVERAGE SCORE */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex items-center justify-between min-h-[160px]">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
              <PieChartIcon size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pt-2 block">
              AVERAGE SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">72%</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 block">Across all tests</span>
          </div>

          {/* Circular Progress Ring Gauge (72%) */}
          <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#6366F1"
                strokeWidth="3.5"
                strokeDasharray="72, 100"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* ── 2. MAIN GRID (LEFT CONTENT 7 COLS, RIGHT LEADERBOARD 5 COLS) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">

        {/* ── LEFT COLUMN (7 COLS) ─────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-8">

          {/* Section 1: Assigned Assessments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recently Assigned Assessments</h2>
              <button
                onClick={() => navigate('/dashboard?tab=explore_mocks')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {assessments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-2 shadow-xs">
                  <ClipboardList className="mx-auto text-slate-300" size={32} />
                  <p className="font-extrabold text-slate-700 text-sm">No Assigned Assessments</p>
                  <p className="text-xs text-slate-400">You currently have no pending assigned assessments.</p>
                </div>
              ) : (
                assessments
                  .map((ast) => {
                    let dueDateText = 'Due: N/A';
                    if (ast.dueDate) {
                      const d = new Date(ast.dueDate);
                      if (!isNaN(d.getTime())) {
                        dueDateText = `Due: ${d.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}`;
                      }
                    }

                    // Cross-reference with myAttempts state array if needed
                    const userAttempt = myAttempts.find((att) => (att.assessment?._id || att.assessment) === ast._id);
                    const isCompleted = ast.isCompleted || (userAttempt && (userAttempt.status === 'submitted' || userAttempt.status === 'graded'));
                    const attemptStatus = ast.attemptStatus || userAttempt?.status || 'not_started';

                    return {
                      id: ast._id,
                      title: ast.title,
                      type: ast.type === 'coding' ? 'Coding' : ast.type === 'mcq' ? 'MCQ' : 'Theory',
                      icon: ast.type === 'coding' ? <Code size={18} className="text-indigo-600" /> : ast.type === 'mcq' ? <CheckSquare size={18} className="text-emerald-600" /> : <BookOpen size={18} className="text-amber-600" />,
                      boxBg: ast.type === 'coding' ? 'bg-indigo-50 border-indigo-100' : ast.type === 'mcq' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100',
                      borderLeft: ast.type === 'coding' ? 'border-l-4 border-l-indigo-500' : ast.type === 'mcq' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-500',
                      dueDate: dueDateText,
                      isCompleted,
                      attemptStatus,
                    };
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border border-slate-100 ${item.borderLeft} p-4 shadow-xs flex items-center justify-between transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.boxBg}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{item.title}</h4>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5 capitalize">{item.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <Calendar size={14} className="text-slate-400 shrink-0" />
                          <span>{item.dueDate}</span>
                        </div>

                        {item.isCompleted ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-xs px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle size={14} className="text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        ) : item.attemptStatus === 'started' ? (
                          <button
                            onClick={() => handleStartTest(item.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Clock size={13} />
                            <span>Resume Test</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTest(item.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            Start Test
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Section 2: Recent Submission Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Submission Status</h2>
              <button
                onClick={() => navigate('/dashboard?tab=progress')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">ASSESSMENT</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">TIME SPENT</th>
                      <th className="py-3 px-4">SCORE</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {dynamicSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ClipboardList className="text-slate-300" size={32} />
                            <p className="text-sm font-extrabold text-slate-700">No Submissions Yet</p>
                            <p className="text-xs text-slate-400 max-w-sm">
                              Results will appear here after an assessment is submitted and evaluated.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dynamicSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                {sub.icon}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 leading-tight">{sub.title}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{sub.category}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`${sub.statusBadge} px-2.5 py-1 rounded-lg text-[11px] font-bold border`}>
                              {sub.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500">{sub.timeSpent}</td>

                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {sub.score}{' '}
                            {sub.details && <span className="text-[11px] text-slate-400 font-normal">{sub.details}</span>}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.statusRaw === 'graded' ? (
                                <button
                                  onClick={() => handleDownloadReport(sub)}
                                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                                >
                                  <Download size={12} className="text-indigo-600" />
                                  <span>Download</span>
                                </button>
                              ) : sub.statusRaw === 'submitted' ? (
                                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                                  In Review
                                </span>
                              ) : sub.statusRaw === 'started' ? (
                                <button
                                  onClick={() => handleStartTest(sub.assessmentId)}
                                  className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                                >
                                  <Clock size={12} />
                                  <span>Resume</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartTest(sub.assessmentId)}
                                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                                >
                                  <span>Start</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Status Legend Footer */}
              <div className="bg-slate-50/40 border-t border-slate-100 px-4 py-3 flex items-center gap-6 text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Graded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Not Attempted</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: LEADERBOARD CARD (5 COLS) ──────────────────────── */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              {/* Leaderboard Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trophy size={18} className="text-amber-500" />
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Leaderboard</h3>
                </div>

                <div className="relative">
                  <select
                    value={leaderboardPeriod}
                    onChange={(e) => setLeaderboardPeriod(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 pr-7 focus:outline-none cursor-pointer"
                  >
                    <option value="This Month">This Month</option>
                    <option value="All Time">All Time</option>
                    <option value="This Week">This Week</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Ranked Student List (Top 5 Performers Only) */}
              <div className="space-y-2">
                {leaderboardList.length > 0 ? (
                  leaderboardList.slice(0, 5).map((item) => (
                    <div
                      key={item.rank}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all ${item.isCurrentUser
                          ? 'bg-indigo-50/70 border border-indigo-100 shadow-2xs'
                          : 'hover:bg-slate-50/80 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${item.rankBg}`}
                        >
                          {item.rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {item.name ? item.name[0].toUpperCase() : 'U'}
                        </div>

                        {/* Name & Subtitle */}
                        <div>
                          <p className={`text-xs font-bold leading-tight ${item.isCurrentUser ? 'text-indigo-950' : 'text-slate-900'}`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">Score: {item.score}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 font-mono">{item.points}</span>
                        {item.badge && <span className="text-sm">{item.badge}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-slate-400">
                    No leaderboard activity available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard Footer */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => navigate('/dashboard?tab=progress')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>View Full Leaderboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. TECHNOLOGY MOCK PREPARATION CAROUSEL SECTION (SCREENSHOT 2) ─── */}
      <div className="pt-6 space-y-6 print:hidden">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Looking to prepare for a specific technology?
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Refine your skills with mock tests categorized by languages and platforms
          </p>
        </div>

        {/* Carousel Container with 5 Cards */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {techTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => navigate('/dashboard?tab=explore_mocks')}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between relative transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group min-h-[220px]"
              >
                {/* Top Badge */}
                <div className="absolute top-3 right-3">
                  {track.badgeType === 'fire' ? (
                    <span className="bg-red-50 text-red-600 border border-red-200/60 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold block">
                      {track.badge}
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold block">
                      {track.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${track.iconBg}`}>
                    {track.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-black text-slate-900">{track.title}</h3>

                  {/* Specs */}
                  <div className="space-y-1 text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>Time: {track.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid size={12} className="text-slate-400" />
                      <span>Objective: {track.objective}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Code size={12} className="text-slate-400" />
                      <span>Programming: {track.programming}</span>
                    </div>
                  </div>
                </div>

                {/* Action Link */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>Start Mock</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Carousel Arrow Button */}
          <button
            onClick={() => navigate('/dashboard?tab=explore_mocks')}
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-700 shadow-md hover:bg-slate-50 transition-all cursor-pointer z-10"
            title="Next Mocks"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Bottom Explore All Mocks Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/dashboard?tab=explore_mocks')}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Explore All Mocks</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboardView;
