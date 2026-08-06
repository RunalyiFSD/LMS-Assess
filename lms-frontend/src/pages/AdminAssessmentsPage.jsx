import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import api from '../services/api';
import {
  ClipboardList,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Code,
  FileText,
  Award,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAssessmentsPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assessments');
      if (res.data?.status === 'success') {
        setAssessments(res.data.data.assessments || []);
      }
    } catch (err) {
      console.warn('Failed to fetch assessments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Toggle active status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/assessments/${id}`, { isActive: newStatus });
      setAssessments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isActive: newStatus } : a))
      );
    } catch (err) {
      alert('Failed to update assessment status');
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete assessment "${title}"?`)) return;
    try {
      await api.delete(`/assessments/${id}`);
      setAssessments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    const matchesType = !typeFilter || a.type === typeFilter;
    const matchesStatus =
      !statusFilter || (statusFilter === 'active' ? a.isActive : !a.isActive);
    const matchesSearch =
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const activeCount = assessments.filter((a) => a.isActive).length;
  const mcqCount = assessments.filter((a) => a.type === 'mcq').length;
  const codingCount = assessments.filter((a) => a.type === 'coding').length;
  const theoryCount = assessments.filter((a) => a.type === 'theory').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-[#121038] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-950">
          <div className="relative z-10 space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors mb-1"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ClipboardList className="text-purple-400" size={30} />
              Tests & Assessments Administration
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Centralized oversight of all examination modules created across departments, status toggling, and duration constraints.
            </p>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ClipboardList size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Assessments</span>
              <p className="text-2xl font-black text-slate-800">{assessments.length} Tests</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Exams</span>
              <p className="text-2xl font-black text-slate-800">{activeCount} Published</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Code size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Coding Sandboxes</span>
              <p className="text-2xl font-black text-slate-800">{codingCount} Exams</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">MCQ & Theory</span>
              <p className="text-2xl font-black text-slate-800">{mcqCount + theoryCount} Exams</p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search assessment by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                <Filter size={15} />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="">All Formats</option>
                <option value="mcq">MCQ Quiz</option>
                <option value="coding">Coding Sandbox</option>
                <option value="theory">Theory Essay</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assessments Roster Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ASSESSMENT TITLE
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    SUBJECT
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    TYPE FORMAT
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    DURATION
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    TOTAL MARKS
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    STATUS TOGGLE
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                      <div className="flex justify-center items-center gap-2">
                        <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                        Loading assessment inventory...
                      </div>
                    </td>
                  </tr>
                ) : filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No assessments found.
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-800">{a.title}</div>
                        {a.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{a.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-purple-600">
                        {a.subject?.name ? `${a.subject.name} (${a.subject.code || ''})` : 'General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${
                            a.type === 'coding'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : a.type === 'mcq'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {a.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {a.duration} mins
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                        {a.totalMarks} Marks
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <button
                          onClick={() => handleToggleStatus(a._id, a.isActive)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            a.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {a.isActive ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
                          <span>{a.isActive ? 'Active' : 'Draft/Disabled'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                        <button
                          onClick={() => handleDeleteAssessment(a._id, a.title)}
                          title="Delete Assessment"
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAssessmentsPage;
