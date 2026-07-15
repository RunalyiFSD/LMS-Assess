import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Code, ListTodo, FileSpreadsheet, ShieldAlert, Award,
  ArrowUpRight, LogIn, ClipboardList, Database, Network, Terminal, Atom, LayoutGrid, Clock,
  Search, Shuffle, ChevronDown, Check
} from 'lucide-react';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const CompanyLogo = ({ name }) => {
  switch (name.toLowerCase()) {
    case 'google':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white shadow-sm border border-slate-100" title="Google">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </span>
      );
    case 'microsoft':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white shadow-sm border border-slate-100" title="Microsoft">
          <svg viewBox="0 0 23 23" className="w-3.5 h-3.5">
            <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
            <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
            <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
            <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
          </svg>
        </span>
      );
    case 'amazon':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white shadow-sm border border-slate-100" title="Amazon">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-slate-800">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.33c-.37.2-.74.34-1.12.43-.37.09-.76.13-1.16.13-.57 0-1.02-.12-1.34-.37-.32-.24-.48-.6-.48-1.07 0-.32.08-.6.23-.83.15-.24.38-.43.68-.58.3-.15.68-.27 1.13-.36.45-.09.96-.18 1.54-.26v-.24c0-.37-.09-.64-.28-.8-.19-.17-.52-.25-.97-.25-.33 0-.64.05-.92.14-.28.09-.59.25-.93.47l-.52-.77c.43-.33.89-.58 1.39-.73.49-.16 1.05-.24 1.66-.24.8 0 1.4.2 1.8.61.4.4.6.99.6 1.78v3.07c0 .4.07.72.2.94v.09h-1.09c-.11-.2-.17-.48-.21-.86zm-2.07-1.74c-.38.07-.71.14-.98.22-.27.08-.48.2-.62.35-.14.15-.21.34-.21.57 0 .28.09.49.27.63.18.14.45.21.82.21.31 0 .59-.06.84-.18.25-.12.44-.29.58-.51.14-.22.21-.49.21-.8v-.52c-.41.05-.71.08-.91.08z"/>
            <path d="M7 17.5c2.5 1.5 5.5 1.5 8 0" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </span>
      );
    case 'facebook':
    case 'meta':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white shadow-sm border border-slate-100" title="Meta">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#1877F2]">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </span>
      );
    case 'yahoo':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white shadow-sm border border-slate-100" title="Yahoo">
          <span className="text-[#6001d2] font-black text-[9px] tracking-tighter" style={{ fontFamily: 'sans-serif' }}>Y!</span>
        </span>
      );
    case 'adobe':
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white shadow-sm border border-slate-100" title="Adobe">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#FF0000]">
            <path d="M14.58 2H24v20L14.58 2zM9.42 2H0v20L9.42 2zM12 9.04L18.07 22h-3.9l-2.07-4.88H8.86L12 9.04z"/>
          </svg>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-500 font-extrabold text-[8px] border border-slate-200" title={name}>
          {name.slice(0, 2).toUpperCase()}
        </span>
      );
  }
};

const FilterDropdown = ({ label, options, selectedValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all gap-1.5"
        >
          <span>{label}: <span className="text-brand-600 font-bold">{options.find(o => o.value === selectedValue)?.label || selectedValue}</span></span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 focus:outline-none overflow-hidden">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors ${
                    selectedValue === option.value ? 'bg-slate-50/80 font-bold text-brand-600' : ''
                  }`}
                >
                  <span>{option.label}</span>
                  {selectedValue === option.value && <Check size={12} className="text-brand-600" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const mncQuestions = [
  {
    id: 1,
    title: 'Gas Station',
    topic: 'Greedy Algorithm',
    difficulty: 'Medium',
    time: '56 Mins',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Adobe'],
    status: 'todo',
  },
  {
    id: 2,
    title: 'Majority Element',
    topic: 'Greedy Algorithm',
    difficulty: 'Easy',
    time: '19 Mins',
    companies: ['Microsoft', 'Yahoo', 'Google', 'Meta'],
    status: 'todo',
  },
  {
    id: 3,
    title: 'Distribute Candy',
    topic: 'Greedy Algorithm',
    difficulty: 'Medium',
    time: '65 Mins',
    companies: ['Microsoft', 'Facebook', 'Amazon'],
    status: 'todo',
  },
  {
    id: 4,
    title: 'Longest Increasing Subsequence',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    time: '30 Mins',
    companies: ['Facebook', 'Yahoo', 'Google', 'Amazon', 'Microsoft'],
    status: 'todo',
  },
  {
    id: 5,
    title: 'Unique Binary Search Trees',
    topic: 'Dynamic Programming',
    difficulty: 'Easy',
    time: '62 Mins',
    companies: ['Amazon', 'Google', 'Adobe', 'Microsoft'],
    status: 'todo',
  },
  {
    id: 6,
    title: 'Two Sum',
    topic: 'Array',
    difficulty: 'Easy',
    time: '15 Mins',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    status: 'todo',
  },
  {
    id: 7,
    title: 'Merge Intervals',
    topic: 'Array',
    difficulty: 'Medium',
    time: '35 Mins',
    companies: ['Google', 'Facebook', 'Microsoft'],
    status: 'todo',
  },
  {
    id: 8,
    title: 'Edit Distance',
    topic: 'Dynamic Programming',
    difficulty: 'Hard',
    time: '45 Mins',
    companies: ['Google', 'Amazon', 'Microsoft'],
    status: 'todo',
  },
  {
    id: 9,
    title: 'Binary Tree Maximum Path Sum',
    topic: 'Tree',
    difficulty: 'Hard',
    time: '50 Mins',
    companies: ['Google', 'Facebook', 'Microsoft'],
    status: 'todo',
  }
];

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

const LandingPage = () => {
  const navigate = useNavigate();
  const [topRankings, setTopRankings] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [highlightedId, setHighlightedId] = useState(null);

  const filteredQuestions = mncQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === 'all' || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' || q.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesTopic =
      selectedTopic === 'all' || q.topic.toLowerCase() === selectedTopic.toLowerCase();

    const matchesCompany =
      selectedCompany === 'all' || q.companies.some((c) => c.toLowerCase() === selectedCompany.toLowerCase());

    return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic && matchesCompany;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'difficulty-asc') {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return (difficultyOrder[a.difficulty.toLowerCase()] || 0) - (difficultyOrder[b.difficulty.toLowerCase()] || 0);
    }
    if (sortBy === 'time-asc') {
      return parseInt(a.time) - parseInt(b.time);
    }
    return a.id - b.id;
  });

  const pickRandomQuestion = () => {
    if (sortedQuestions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * sortedQuestions.length);
    const randomQuestion = sortedQuestions[randomIndex];
    
    setHighlightedId(randomQuestion.id);
    
    const element = document.getElementById(`mnc-quest-${randomQuestion.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
      setHighlightedId(null);
    }, 2000);
  };

  useEffect(() => {
    const fetchTopFive = async () => {
      try {
        const response = await api.get('/leaderboard/top-five');
        if (response.data?.status === 'success') {
          setTopRankings(response.data.data.rankings || []);
        }
      } catch (err) {
        // Fallback mock top five rankings if API fails or database is empty
        setTopRankings([
          { rank: 1, name: 'Alice Johnson', totalScore: 840, assessmentsCompleted: 12, badge: 'Gold Medalist' },
          { rank: 2, name: 'David Smith', totalScore: 790, assessmentsCompleted: 10, badge: 'Silver Medalist' },
          { rank: 3, name: 'Emma Watson', totalScore: 760, assessmentsCompleted: 9, badge: 'Bronze Medalist' },
          { rank: 4, name: 'Robert Downey', totalScore: 710, assessmentsCompleted: 11, badge: 'Coding Ninja' },
          { rank: 5, name: 'Sophia Loren', totalScore: 680, assessmentsCompleted: 8, badge: 'Bronze Solver' },
        ]);
      }
    };
    fetchTopFive();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navbar header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">A</span>
          <span className="font-bold text-slate-800 text-lg">AssessLMS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Sign In</Link>
          <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Dedicated Assessment Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 mt-4 leading-tight tracking-tight">
            The Smart Way to Evaluate & Enhance Student Skills
          </h1>
          <p className="text-slate-500 text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Host, schedule, and grade MCQ, Coding, and Theory assessments with automated sandboxed compilation, keyword evaluation, and real-time rankings.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
              Create Free Account <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Student Login
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-black text-brand-600">15k+</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Assessments Conducted</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand-600">8k+</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Active Students</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand-600">99.8%</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Sandbox Uptime</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand-600">300+</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Verified Subjects</p>
          </div>
        </div>
      </section>

      {/* Top Coding Interview Questions */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Top Coding Interview Questions
            </h2>
            <p className="text-xs text-slate-400 mt-2">Practice real interview problems asked by top MNCs and tech giants</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-8 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for problems or keywords"
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-sm"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <FilterDropdown
                label="Difficulty"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Easy', value: 'easy' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Hard', value: 'hard' },
                ]}
                selectedValue={selectedDifficulty}
                onChange={setSelectedDifficulty}
              />
              <FilterDropdown
                label="Status"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Todo', value: 'todo' },
                  { label: 'Solved', value: 'solved' },
                ]}
                selectedValue={selectedStatus}
                onChange={setSelectedStatus}
              />
              <FilterDropdown
                label="Topics"
                options={[
                  { label: 'All Topics', value: 'all' },
                  { label: 'Greedy Algorithm', value: 'greedy algorithm' },
                  { label: 'Dynamic Programming', value: 'dynamic programming' },
                  { label: 'Array', value: 'array' },
                  { label: 'Tree', value: 'tree' },
                ]}
                selectedValue={selectedTopic}
                onChange={setSelectedTopic}
              />
              <FilterDropdown
                label="Companies"
                options={[
                  { label: 'All Companies', value: 'all' },
                  { label: 'Google', value: 'google' },
                  { label: 'Microsoft', value: 'microsoft' },
                  { label: 'Amazon', value: 'amazon' },
                  { label: 'Meta', value: 'meta' },
                  { label: 'Yahoo', value: 'yahoo' },
                ]}
                selectedValue={selectedCompany}
                onChange={setSelectedCompany}
              />
              <FilterDropdown
                label="Sort By"
                options={[
                  { label: 'Relevance', value: 'relevance' },
                  { label: 'Title (A-Z)', value: 'title' },
                  { label: 'Difficulty (Easy first)', value: 'difficulty-asc' },
                  { label: 'Time (Shortest first)', value: 'time-asc' },
                ]}
                selectedValue={sortBy}
                onChange={setSortBy}
              />

              {/* Pick Random Button */}
              <button
                onClick={pickRandomQuestion}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 text-xs transition-colors shadow-sm"
              >
                <Shuffle size={14} /> Pick Random
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {sortedQuestions.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-slate-200/50 rounded-xl text-slate-400 text-sm">
                No problems match your current filters. Try adjusting them.
              </div>
            ) : (
              sortedQuestions.map((q) => {
                const diffColor =
                  q.difficulty.toLowerCase() === 'easy'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : q.difficulty.toLowerCase() === 'medium'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div
                    key={q.id}
                    id={`mnc-quest-${q.id}`}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl transition-all duration-300 gap-4 ${
                      highlightedId === q.id
                        ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                        : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/30 hover:shadow-sm'
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-start sm:items-center gap-3 md:gap-5 flex-1 w-full">
                      {/* Title */}
                      <Link
                        to="/login"
                        className="font-bold text-sky-700 hover:text-brand-600 text-sm w-full sm:w-[220px] md:w-[240px] lg:w-[260px] truncate shrink-0"
                      >
                        {q.title}
                      </Link>

                      {/* Topic Badge */}
                      <div className="w-full sm:w-[130px] md:w-[150px] lg:w-[170px] shrink-0">
                        <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200/60 rounded px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                          {q.topic}
                        </span>
                      </div>

                      {/* Difficulty Badge */}
                      <div className="w-full sm:w-[70px] md:w-[80px] shrink-0">
                        <span className={`inline-block border rounded px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${diffColor}`}>
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="w-full sm:w-[80px] md:w-[90px] shrink-0">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold whitespace-nowrap">
                          <Clock size={14} className="text-slate-400" />
                          {q.time}
                        </span>
                      </div>

                      {/* Targeted MNC Logos */}
                      <div className="flex items-center gap-1 w-full sm:w-[90px] md:w-[100px] lg:w-[120px] shrink-0">
                        {q.companies.slice(0, 3).map((comp, idx) => (
                          <CompanyLogo key={idx} name={comp} />
                        ))}
                        {q.companies.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50">
                            +{q.companies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Solve Action */}
                    <div>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
                      >
                        Solve <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center mt-10">
            <Link to="/login" className="inline-flex items-center justify-center font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg px-6 py-2.5 text-xs transition-colors shadow-sm gap-1">
              View All Questions
            </Link>
          </div>
        </div>
      </section>

      {/* Looking to prepare for a specific technology? */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Looking to prepare for a specific technology?
            </h2>
            <p className="text-xs text-slate-400 mt-2">Practice and refine your skills with mock tests categorized by language and platform domains</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
            {techTracks.map((track) => (
              <div
                key={track.id}
                className={`relative bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                  track.popular ? 'border-cyan-400/80 ring-1 ring-cyan-400/30' : 'border-slate-200/80'
                }`}
              >
                {/* Badge tags */}
                <div className="absolute -top-3 right-3 z-10 flex">
                  {track.popular && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 shadow-sm">
                      ⭐ Popular
                    </span>
                  )}
                  {track.registrations && (
                    <span className="bg-red-50 text-red-600 border border-red-200/60 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 shadow-sm">
                      🔥 {track.registrations}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Icon container */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${track.iconColor}`}>
                    {track.icon === 'clipboard' && <ClipboardList size={22} />}
                    {track.icon === 'database' && <Database size={22} />}
                    {track.icon === 'network' && <Network size={22} />}
                    {track.icon === 'terminal' && <Terminal size={22} />}
                    {track.icon === 'atom' && <Atom size={22} />}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{track.title}</h3>
                  </div>

                  {/* Meta Specifications */}
                  <div className="space-y-2 pt-2 border-t border-slate-100/50">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Clock size={14} className="text-slate-400" />
                      <span>Time: {track.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <LayoutGrid size={14} className="text-slate-400" />
                      <span>Objective: {track.objective}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Code size={14} className="text-slate-400" />
                      <span>Programming: {track.programming}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom link */}
                <div className="border-t border-slate-100 pt-4 mt-6 text-center">
                  <Link to="/login" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-micro">
                    {track.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/login" className="text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">
              Explore All Mocks
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <Award className="text-brand-500 animate-bounce" /> Top Performers Standings
            </h2>
            <p className="text-xs text-slate-400 mt-2">Rankings updated after completed assessments</p>
          </div>

          {/* Cards for Top 5 */}
          <div className="space-y-4">
            {topRankings.map((student) => (
              <div
                key={student.rank}
                className="flex items-center justify-between p-4 border border-slate-100 hover:border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Display */}
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    student.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                    student.rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                    student.rank === 3 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {student.rank}
                  </span>

                  {/* Profile & Name */}
                  <div className="flex items-center gap-3">
                    {student.profilePicture ? (
                      <img src={student.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                      <span className="inline-block text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-medium mt-0.5">
                        {student.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{student.totalScore} pts</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{student.assessmentsCompleted} assessments completed</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/leaderboard" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                View More <ArrowUpRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Loved by Students & Instructors</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <p className="text-slate-500 italic text-sm">
                "The sandboxed coding executor is extremely smooth. I write my solutions in Python and immediately get tests outputs without loading local environments!"
              </p>
              <p className="font-bold text-slate-800 text-xs mt-4">— James Carter, Computer Science Student</p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <p className="text-slate-500 italic text-sm">
                "Scheduling assessments is quick and manual theory reviews are a breeze. The automatic keyword checks save me hours when grading essays."
              </p>
              <p className="font-bold text-slate-800 text-xs mt-4">— Dr. Clara Mendelson, Instructor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black">Ready to level up your grading?</h2>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed">
            Create an administrator, instructor, or student profile today and discover the ultimate assessment solution.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center font-bold rounded-lg px-6 py-2.5 text-sm bg-white text-slate-900 hover:bg-slate-100 transition-all duration-200 shadow-sm"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center font-bold rounded-lg px-6 py-2.5 text-sm border border-slate-700 hover:bg-slate-800 text-white transition-all duration-200"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-center text-slate-500 text-xs border-t border-slate-800">
        <p>© 2026 AssessLMS Inc. All rights reserved. Built with clean MERN architecture and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
