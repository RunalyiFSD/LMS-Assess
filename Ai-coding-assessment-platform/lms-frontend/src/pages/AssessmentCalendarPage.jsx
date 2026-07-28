import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  BookOpen,
  Award,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Sparkles,
  FileText,
  Code2,
  HelpCircle,
  TrendingUp,
  List,
  CalendarDays,
  Grid
} from 'lucide-react';

const CATEGORY_COLORS = {
  Quiz: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100',
  },
  Test: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    badgeBg: 'bg-amber-100',
  },
  Assignment: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    badgeBg: 'bg-indigo-100',
  },
  Exam: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    badgeBg: 'bg-rose-100',
  },
};

// Generate initial mock assessment dates dynamically relative to current real year & month
const realNow = new Date();
const currentYear = realNow.getFullYear();
const currentMonthStr = (realNow.getMonth() + 1).toString().padStart(2, '0');
const getDynamicDate = (dayNum) => `${currentYear}-${currentMonthStr}-${dayNum.toString().padStart(2, '0')}`;

const INITIAL_MOCK_EVENTS = [
  {
    id: 'evt_1',
    title: 'Data Structures Quiz',
    subject: { name: 'Data Structures', code: 'CS201' },
    category: 'Quiz',
    type: 'mcq',
    date: getDynamicDate(29),
    time: '11:59 PM',
    duration: 30,
    totalMarks: 25,
    passingScore: 10,
    description: 'Covers Binary Trees, Graphs, and Hash Tables.'
  },
  {
    id: 'evt_2',
    title: 'Database Systems Assignment',
    subject: { name: 'Database Systems', code: 'CS302' },
    category: 'Assignment',
    type: 'mcq',
    date: getDynamicDate(2),
    time: '11:59 PM',
    duration: 60,
    totalMarks: 50,
    passingScore: 20,
    description: 'SQL queries & Normalization exercises.'
  },
  {
    id: 'evt_3',
    title: 'Operating Systems Test',
    subject: { name: 'Operating Systems', code: 'CS305' },
    category: 'Test',
    type: 'coding',
    date: getDynamicDate(5),
    time: '10:00 AM',
    duration: 45,
    totalMarks: 30,
    passingScore: 12,
    description: 'Process Synchronization and Deadlock algorithms.'
  },
  {
    id: 'evt_4',
    title: 'Computer Networks Exam',
    subject: { name: 'Computer Networks', code: 'CS401' },
    category: 'Exam',
    type: 'mcq',
    date: getDynamicDate(7),
    time: '02:00 PM',
    duration: 90,
    totalMarks: 100,
    passingScore: 40,
    description: 'Midterm exam covering OSI & TCP/IP stack.'
  },
  {
    id: 'evt_5',
    title: 'Web Development Quiz',
    subject: { name: 'Web Development', code: 'CS108' },
    category: 'Quiz',
    type: 'mcq',
    date: getDynamicDate(13),
    time: '11:59 PM',
    duration: 30,
    totalMarks: 20,
    passingScore: 8,
    description: 'React Hooks and State Management.'
  },
  {
    id: 'evt_6',
    title: 'Software Engineering Assignment',
    subject: { name: 'Software Engineering', code: 'CS402' },
    category: 'Assignment',
    type: 'theory',
    date: getDynamicDate(15),
    time: '11:59 PM',
    duration: 60,
    totalMarks: 40,
    passingScore: 16,
    description: 'UML Class Diagram & Agile User Stories.'
  },
  {
    id: 'evt_7',
    title: 'Data Structures Exam',
    subject: { name: 'Data Structures', code: 'CS201' },
    category: 'Exam',
    type: 'coding',
    date: getDynamicDate(20),
    time: '02:00 PM',
    duration: 120,
    totalMarks: 100,
    passingScore: 40,
    description: 'Comprehensive Coding Assessment.'
  },
  {
    id: 'evt_8',
    title: 'DBMS Test',
    subject: { name: 'Database Systems', code: 'CS302' },
    category: 'Test',
    type: 'coding',
    date: getDynamicDate(23),
    time: '10:00 AM',
    duration: 45,
    totalMarks: 35,
    passingScore: 14,
    description: 'Transactions & Indexing.'
  },
  {
    id: 'evt_9',
    title: 'Computer Networks Assignment',
    subject: { name: 'Computer Networks', code: 'CS401' },
    category: 'Assignment',
    type: 'mcq',
    date: getDynamicDate(25), // Today's date
    time: '11:59 PM',
    duration: 45,
    totalMarks: 30,
    passingScore: 12,
    description: 'IP Subnetting calculations.'
  },
  {
    id: 'evt_10',
    title: 'Operating Systems Quiz',
    subject: { name: 'Operating Systems', code: 'CS305' },
    category: 'Quiz',
    type: 'mcq',
    date: getDynamicDate(28),
    time: '11:59 PM',
    duration: 25,
    totalMarks: 15,
    passingScore: 6,
    description: 'Virtual Memory management.'
  }
];

const AssessmentCalendarPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date();

  // Current view state: 'month', 'week', 'list'
  const [viewMode, setViewMode] = useState('month');
  
  // Dynamic calendar month navigation defaulting to current real month & date
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  
  // Events state
  const [events, setEvents] = useState(INITIAL_MOCK_EVENTS);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewDetailModal, setViewDetailModal] = useState(null);

  // Form State for Instructor Event Create/Update
  const [formData, setFormData] = useState({
    title: '',
    subjectName: 'Computer Science',
    category: 'Quiz',
    type: 'mcq',
    date: getDynamicDate(today.getDate()),
    time: '11:59 PM',
    duration: 45,
    totalMarks: 50,
    passingScore: 20,
    description: ''
  });

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  // Fetch real assessments from backend if available
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/assessments/calendar');
        if (response.data?.status === 'success' && response.data?.data?.events?.length > 0) {
          const apiEvents = response.data.data.events.map((ev) => {
            const dt = new Date(ev.startTime);
            const dateStr = dt.toISOString().split('T')[0];
            const hours = dt.getHours();
            const minutes = dt.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;

            return {
              id: ev.id,
              title: ev.title,
              subject: ev.subject || { name: 'General', code: 'GEN' },
              category: ev.category || 'Assignment',
              type: ev.type || 'mcq',
              date: dateStr,
              time: formattedTime,
              duration: ev.duration || 60,
              totalMarks: ev.totalMarks || 100,
              passingScore: ev.passingScore || 40,
              description: ev.description || ''
            };
          });
          setEvents((prev) => [...apiEvents, ...prev]);
        }
      } catch (err) {
        console.warn('Using local calendar schedule dataset:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  // Helper functions for Calendar navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  // Open Create Modal (Instructor only)
  const openCreateModal = (dayNum = null) => {
    const yr = currentDate.getFullYear();
    const mo = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dy = (dayNum || selectedDay).toString().padStart(2, '0');
    const selectedDateStr = `${yr}-${mo}-${dy}`;

    setEditingEvent(null);
    setFormData({
      title: '',
      subjectName: 'Computer Science',
      category: 'Quiz',
      type: 'mcq',
      date: selectedDateStr,
      time: '11:59 PM',
      duration: 45,
      totalMarks: 50,
      passingScore: 20,
      description: ''
    });
    setModalOpen(true);
  };

  // Open Edit Modal (Instructor) or View Detail Modal (Student)
  const handleEventClick = (evt, e) => {
    e.stopPropagation();
    if (isInstructor) {
      setEditingEvent(evt);
      setFormData({
        title: evt.title,
        subjectName: evt.subject?.name || 'Computer Science',
        category: evt.category || 'Assignment',
        type: evt.type || 'mcq',
        date: evt.date,
        time: evt.time || '11:59 PM',
        duration: evt.duration || 45,
        totalMarks: evt.totalMarks || 50,
        passingScore: evt.passingScore || 20,
        description: evt.description || ''
      });
      setModalOpen(true);
    } else {
      setViewDetailModal(evt);
    }
  };

  // Handle Form Submit (Instructor Create/Update)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                title: formData.title,
                category: formData.category,
                type: formData.type,
                date: formData.date,
                time: formData.time,
                duration: Number(formData.duration),
                totalMarks: Number(formData.totalMarks),
                passingScore: Number(formData.passingScore),
                description: formData.description,
                subject: { name: formData.subjectName, code: 'SUBJ' }
              }
            : ev
        )
      );
    } else {
      const newEvt = {
        id: `evt_${Date.now()}`,
        title: formData.title,
        category: formData.category,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingScore: Number(formData.passingScore),
        description: formData.description,
        subject: { name: formData.subjectName, code: 'SUBJ' }
      };
      setEvents((prev) => [newEvt, ...prev]);
    }
    setModalOpen(false);
  };

  // Handle Event Delete (Instructor)
  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setModalOpen(false);
  };

  // Filter events by selected Category
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'All') return true;
    return ev.category === selectedCategory;
  });

  // Fully Dynamic Calendar Month Grid Calculation
  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month index (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Total days in previous month
    const prevMonthDaysCount = new Date(year, month, 0).getDate();

    const gridCells = [];

    // 1. Preceding month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      gridCells.push(
        <div key={`prev_${dayNum}`} className="bg-slate-50/50 p-2 min-h-[110px] border-b border-r border-slate-200/60 opacity-40 text-slate-400">
          <span className="text-xs font-semibold">{dayNum}</span>
        </div>
      );
    }

    // 2. Current month days
    const isCurrentRealMonth = today.getFullYear() === year && today.getMonth() === month;
    const realTodayDate = today.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr || ev.date.startsWith(dateStr));
      
      const isToday = isCurrentRealMonth && day === realTodayDate;
      const isSelected = day === selectedDay;

      gridCells.push(
        <div
          key={`day_${day}`}
          onClick={() => {
            setSelectedDay(day);
            if (isInstructor) openCreateModal(day);
          }}
          className={`p-2 min-h-[115px] border-b border-r border-slate-200/70 transition-colors relative flex flex-col justify-between group cursor-pointer ${
            isSelected
              ? 'bg-indigo-50/40'
              : isToday
              ? 'bg-amber-50/30'
              : 'bg-white hover:bg-slate-50/80'
          }`}
        >
          {/* Day number header */}
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                  : isToday
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'text-slate-700 group-hover:text-indigo-600'
              }`}
            >
              {day}
            </span>

            {isInstructor && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCreateModal(day);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5"
                title="Add Schedule"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {/* Event Pills inside Day Cell */}
          <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar pr-0.5">
            {dayEvents.map((evt) => {
              const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Assignment;
              return (
                <div
                  key={evt.id}
                  onClick={(e) => handleEventClick(evt, e)}
                  className={`p-1.5 rounded-lg border text-left transition-all duration-200 hover:shadow-md cursor-pointer ${color.bg} ${color.border}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${color.badgeBg} ${color.text}`}>
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{evt.time}</span>
                  </div>
                  <div className={`text-[11px] font-bold truncate mt-0.5 ${color.text}`}>
                    {evt.subject?.name || evt.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 3. Trailing next month days to complete final grid row
    const totalCellsSoFar = gridCells.length;
    const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      gridCells.push(
        <div key={`next_${dayNum}`} className="bg-slate-50/50 p-2 min-h-[110px] border-b border-r border-slate-200/60 opacity-40 text-slate-400">
          <span className="text-xs font-semibold">{dayNum}</span>
        </div>
      );
    }

    return gridCells;
  };

  // List of upcoming assessments for Sidebar
  const sortedUpcomingEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* Top Header Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Assessment Calendar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            View and manage your upcoming assessments
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Calendar Card Container */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
              
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                
                {/* Left Controls: Today & Month Navigator */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleToday}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Today
                  </Button>

                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>

                {/* Right Controls: View Switcher, Filter, Schedule Action */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'month'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'week'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'list'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      List
                    </button>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`flex items-center gap-2 border px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory !== 'All'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Filter size={14} />
                      <span>{selectedCategory === 'All' ? 'Filter' : selectedCategory}</span>
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in slide-in-from-top-2">
                        {['All', 'Quiz', 'Test', 'Assignment', 'Exam'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                              selectedCategory === cat
                                ? 'bg-indigo-50 text-indigo-600 font-bold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cat}</span>
                            {selectedCategory === cat && <CheckCircle2 size={14} className="text-indigo-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isInstructor && (
                    <Button
                      onClick={() => openCreateModal()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      <span>Schedule Assessment</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* View Mode Rendering */}
              {viewMode === 'month' && (
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  <div className="grid grid-cols-7 bg-slate-200/40">
                    {renderMonthGrid()}
                  </div>
                </div>
              )}

              {viewMode === 'week' && (
                <div className="border border-slate-200 rounded-2xl p-6 text-center space-y-4 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-700">Week View ({monthNames[currentDate.getMonth()]} {currentDate.getFullYear()})</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                      const dateStr = `${currentYear}-${currentMonthStr}-${d.toString().padStart(2, '0')}`;
                      const evts = filteredEvents.filter((ev) => ev.date === dateStr);
                      return (
                        <div key={d} className="bg-white p-3 rounded-xl border border-slate-200 text-left space-y-2">
                          <span className="text-xs font-extrabold text-indigo-600">{monthNames[currentDate.getMonth()].slice(0, 3)} {d}</span>
                          <div className="space-y-1">
                            {evts.map((ev) => (
                              <div key={ev.id} className="text-[10px] p-1 bg-indigo-50 text-indigo-700 font-bold rounded truncate">
                                {ev.title}
                              </div>
                            ))}
                            {evts.length === 0 && <span className="text-[10px] text-slate-400 block">No exams</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-3">
                  {filteredEvents.map((evt) => {
                    const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Assignment;
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => handleEventClick(evt, e)}
                        className="flex flex-wrap items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${color.dot}`}></span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{evt.title}</h4>
                            <p className="text-xs text-slate-500">{evt.subject?.name} • {evt.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                          <span>{evt.date}</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">{evt.time}</span>
                          <span className={`px-2.5 py-1 rounded-lg font-bold ${color.badgeBg} ${color.text}`}>
                            {evt.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Bottom Motivation Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Plan ahead, perform better</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Keep track of all your assessments and manage your time effectively.
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar Component */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upcoming Assessments Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900">Upcoming Assessments</h3>

              <div className="space-y-4">
                {sortedUpcomingEvents.map((evt) => {
                  const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Assignment;
                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => handleEventClick(evt, e)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${color.bg} ${color.text} flex items-center justify-center border ${color.border}`}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-800">{evt.subject?.name || evt.title}</h5>
                          <span className="text-[10px] text-slate-400 font-medium">{evt.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">
                          {monthNames[currentDate.getMonth()].slice(0, 3)} {new Date(evt.date).getDate() || 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{evt.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50 text-xs font-bold py-2.5 rounded-xl"
              >
                View All Assessments &gt;
              </Button>
            </div>

            {/* Legend Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Legend</h3>

              <div className="space-y-3">
                {Object.keys(CATEGORY_COLORS).map((cat) => {
                  const color = CATEGORY_COLORS[cat];
                  return (
                    <div key={cat} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`}></span>
                      <span>{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Instructor Schedule / Edit Assessment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingEvent ? 'Update Assessment Schedule' : 'Schedule New Assessment'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Data Structures Midterm Quiz"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category Tag</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="Quiz">Quiz (Green)</option>
                    <option value="Test">Test (Amber)</option>
                    <option value="Assignment">Assignment (Indigo)</option>
                    <option value="Exam">Exam (Rose)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 11:59 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="mr-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    <span>Delete Event</span>
                  </button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  {editingEvent ? 'Save Changes' : 'Schedule Assessment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student View Details Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${CATEGORY_COLORS[viewDetailModal.category]?.badgeBg || 'bg-indigo-100'} ${CATEGORY_COLORS[viewDetailModal.category]?.text || 'text-indigo-700'}`}>
                  {viewDetailModal.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{viewDetailModal.title}</h3>
              </div>
              <button onClick={() => setViewDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500">Subject</span>
                <span className="font-bold text-slate-800">{viewDetailModal.subject?.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500">Scheduled Date</span>
                <span className="font-bold text-slate-800">{viewDetailModal.date} at {viewDetailModal.time}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500">Duration</span>
                <span className="font-bold text-slate-800">{viewDetailModal.duration} Mins</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500">Total Marks</span>
                <span className="font-bold text-slate-800">{viewDetailModal.totalMarks} Marks</span>
              </div>

              {viewDetailModal.description && (
                <p className="text-xs text-slate-500 leading-relaxed p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  {viewDetailModal.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-bold text-slate-400">Student Access Mode: Read Only</span>
              <Button
                onClick={() => {
                  setViewDetailModal(null);
                  navigate(`/lobby/${viewDetailModal.id}`);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Go to Lobby
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AssessmentCalendarPage;
