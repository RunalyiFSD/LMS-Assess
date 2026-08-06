import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Bell,
  Check,
  Compass,
  Rocket,
  ShieldCheck,
  Zap,
  ChevronRight,
  Code2,
  Building2
} from 'lucide-react';

const FEATURE_BRIEFS = {
  'company-mock': {
    id: 'company-mock',
    title: 'Company Mock Assessments',
    badge: 'Under Active Engineering • Upcoming Feature',
    icon: Building2,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    tagline: 'Real company interview simulations for top product & IT firms.',
    description:
      'This module will feature company-specific assessment environments replicating actual online tests of tech companies like Infosys, Uber, LinkedIn, MindTree, TCS, and Amazon. It includes time-boxed technical aptitude questions, domain MCQs, and real-time coding sandboxes aligned with company hiring patterns.',
    plannedCapabilities: [
      'Company Placement Test Simulations (Uber, Amazon, Infosys, TCS, LinkedIn, MindTree)',
      'Exact Exam Duration & Sectional Time Limits',
      'Multi-Language Code Execution Sandbox with Hidden Test Cases',
      'Hiring Readiness Score & Benchmark Percentile Reports',
      'Detailed Question Solutions & Performance Insights'
    ]
  },
  'language-mock': {
    id: 'language-mock',
    title: 'Language & Tech Stack Mock Assessments',
    badge: 'Under Active Engineering • Upcoming Feature',
    icon: Code2,
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    accentBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    tagline: 'Focused technology drills and programming language certification tests.',
    description:
      'Master core programming languages and frameworks including React.js, Java Core & OOPs, Python, SQL Databases, C++ Data Structures, and Node.js backend development through targeted quizzes and coding challenges.',
    plannedCapabilities: [
      'Stack-Wise Quizzes (React, Java, Python, SQL, C++, Node.js)',
      'Topic-wise Skill Radar & Proficiency Analytics',
      'Interactive Code Sandbox Verification & Immediate Execution Logs',
      'Earnable Language Badges & Verified Skill Certificates'
    ]
  },
  'admin-users': {
    id: 'admin-users',
    title: 'Student & Instructor Management Hub',
    badge: 'Under Development • Q3 2026',
    icon: Users,
    gradient: 'from-purple-500 to-indigo-600',
    accentBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    tagline: 'Comprehensive user administration roster and access control matrix.',
    description:
      'This module will empower administrators to manage student rosters, assign instructor permissions, import bulk student accounts via CSV, and monitor active sessions across all departments in real time.',
    plannedCapabilities: [
      'Bulk CSV Import & Automated Account Provisioning',
      'Role & Fine-grained Permission Matrix Configuration',
      'Student Batch, Department & College Grouping',
      'Account Security & Activity Audit Logging'
    ]
  },
  'admin-subjects': {
    id: 'admin-subjects',
    title: 'Course & Subject Directory',
    badge: 'In Roadmap Pipeline',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    tagline: 'Centralized curriculum directory and subject code management.',
    description:
      'The Subject Directory will allow institute admins to define course curricula, link subjects with lead faculty, set prerequisite requirements, and configure default grading rubrics.',
    plannedCapabilities: [
      'Curriculum Code & Department Mapping',
      'Lead Instructor Assignment & Workload Distribution',
      'Subject Prerequisite Dependency Trees',
      'Course Syllabus & Learning Asset Repositories'
    ]
  },
  'instructor-grade': {
    id: 'instructor-grade',
    title: 'Submission Evaluation & Feedback Engine',
    badge: 'Under Active Development',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-600',
    accentBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    tagline: 'Automated test suite execution & manual code review workspace.',
    description:
      'This page will provide instructors with a unified grading queue to inspect student code submissions, run custom edge-case tests, add inline code comments, and publish graded feedback.',
    plannedCapabilities: [
      'Side-by-Side Student Code Reviewer with Syntax Highlighting',
      'Automated Test Case Execution & Memory Metric Logs',
      'Rubric-based Theory Answer Evaluation',
      'Bulk Feedback Publishing & Re-grade Request System'
    ]
  },
  'certificates': {
    id: 'certificates',
    title: 'Verifiable Skill Certificates & Badges',
    badge: 'Planned Feature • Phase 2',
    icon: Award,
    gradient: 'from-amber-500 to-orange-600',
    accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    tagline: 'Cryptographically verifiable digital certificates for top performers.',
    description:
      'Students who complete skill assessment benchmarks will be able to earn, view, and share official digital certificates with QR verification links on LinkedIn, GitHub, and resumes.',
    plannedCapabilities: [
      'High-Resolution PDF Certificate Generation',
      'One-Click LinkedIn Skill Badge Integration',
      'Public QR Code Verification & Credential Registry',
      'Custom Institute Watermark & Authorized Signatures'
    ]
  },
  'schedule': {
    id: 'schedule',
    title: 'Assessment Calendar & Event Scheduler',
    badge: 'In Roadmap Pipeline',
    icon: Calendar,
    gradient: 'from-rose-500 to-pink-600',
    accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    tagline: 'Scheduled exams, deadline countdowns, and automated notifications.',
    description:
      'A calendar view for students and instructors to track upcoming proctored tests, submission deadlines, synchronized batch exams, and mock drill windows.',
    plannedCapabilities: [
      'Interactive Calendar & Batch Timetable Sync',
      'Time-windowed Exam Entry Locks & Proctored Schedules',
      'Google & Outlook Calendar Event Exports',
      'Automated Email & Browser Push Reminders'
    ]
  },
  'default': {
    id: 'default',
    title: 'Upcoming Platform Module',
    badge: 'Feature Roadmap • In Design',
    icon: Sparkles,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    tagline: 'We are crafting something extraordinary for this space.',
    description:
      'This area of AssessLMS is currently under active design and engineering. We are building powerful features to streamline technical evaluation and learning analytics.',
    plannedCapabilities: [
      'AI-Assisted Code Refactoring & Real-time Hint Engine',
      'Live Peer Pair-Programming Sandboxes',
      'Real-Time Anti-Cheat Behavioral Monitoring',
      'Customizable Analytics & Performance Metrics'
    ]
  }
};

const FuturePage = ({ routeKey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [notified, setNotified] = useState(false);
  const [activePreviewKey, setActivePreviewKey] = useState(null);

  // Determine key based on prop or pathname
  const detectKey = () => {
    if (routeKey && FEATURE_BRIEFS[routeKey]) return routeKey;
    const path = location.pathname.toLowerCase();
    if (path.includes('company-mock') || path.includes('cmp_')) return 'company-mock';
    if (path.includes('language-mock') || path.includes('lang_')) return 'language-mock';
    if (path.includes('/admin/users')) return 'admin-users';
    if (path.includes('/admin/subjects')) return 'admin-subjects';
    if (path.includes('/instructor/grade')) return 'instructor-grade';
    if (path.includes('/certificates')) return 'certificates';
    if (path.includes('/schedule')) return 'schedule';
    return 'default';
  };

  const currentKey = activePreviewKey || detectKey();
  const feature = FEATURE_BRIEFS[currentKey] || FEATURE_BRIEFS['default'];
  const IconComponent = feature.icon;

  const handleNotifyMe = () => {
    setNotified(true);
    setTimeout(() => {
      setNotified(false);
    }, 4000);
  };

  const content = (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1A1535] via-[#231B45] to-[#120E28] text-slate-100 rounded-3xl p-6 sm:p-10 border border-[#3D317C]/50 shadow-2xl relative overflow-hidden my-2">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/50 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl border border-slate-700 transition-all duration-200"
          >
            <ArrowLeft size={16} />
            <span>Return Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border shadow-sm ${feature.accentBg}`}>
              {feature.badge}
            </span>
          </div>
        </div>

        {/* Feature Overview Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-lg">
              <Rocket size={14} className="animate-pulse text-indigo-400" />
              <span>Module Roadmap Briefing</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {feature.title}
            </h1>

            <p className="text-base sm:text-lg text-indigo-200/90 font-medium">
              {feature.tagline}
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
              {feature.description}
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                onClick={handleNotifyMe}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                {notified ? <Check size={18} /> : <Bell size={18} />}
                <span>{notified ? 'Notification Registered!' : 'Notify Me Upon Release'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-slate-700 text-slate-200 hover:bg-slate-800/80 font-bold px-5 py-3 rounded-xl"
              >
                Go to Dashboard
              </Button>
            </div>

            {notified && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/60 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle2 size={16} />
                <span>You will receive an update in notifications as soon as this feature launches!</span>
              </div>
            )}
          </div>

          {/* Feature Hero Card Graphic */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group w-full max-w-sm">
              <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500`}></div>
              <div className="relative bg-[#1A1535] border border-slate-700/80 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr ${feature.gradient} text-white flex items-center justify-center shadow-xl shadow-indigo-500/20`}>
                  <IconComponent size={40} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">In Active Engineering</h3>
                  <p className="text-xs text-slate-400 mt-1">AssessLMS Platform Engine</p>
                </div>
                <div className="pt-3 border-t border-slate-800 text-[11px] text-indigo-300 font-mono flex items-center justify-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  <span>Status: Feature Planned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Planned Capabilities Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Upcoming Feature Highlights</h2>
              <p className="text-xs text-slate-400">Key specs being engineered for this module</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feature.plannedCapabilities.map((cap, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl hover:border-indigo-500/40 transition-colors"
              >
                <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-200 leading-snug">{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Other Future Modules Selector */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Compass size={16} className="text-indigo-400" />
              <span>Explore Other Planned Platform Modules</span>
            </div>
            {activePreviewKey && (
              <button
                onClick={() => setActivePreviewKey(null)}
                className="text-xs font-bold text-indigo-400 hover:underline"
              >
                Reset to Current Page
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.keys(FEATURE_BRIEFS)
              .filter((k) => k !== 'default')
              .map((key) => {
                const item = FEATURE_BRIEFS[key];
                const ItemIcon = item.icon;
                const isSelected = currentKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActivePreviewKey(key)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <ItemIcon size={18} className={isSelected ? 'text-indigo-400' : 'text-slate-400'} />
                      <ChevronRight size={14} className="opacity-50" />
                    </div>
                    <span className="text-[11px] font-bold truncate w-full">{item.title}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

  // If user is authenticated, wrap with app Layout, otherwise render standalone
  if (user) {
    return <Layout>{content}</Layout>;
  }

  return (
    <div className="min-h-screen bg-[#0F0B21] px-4 py-8 flex flex-col justify-center">
      {content}
    </div>
  );
};

export default FuturePage;
