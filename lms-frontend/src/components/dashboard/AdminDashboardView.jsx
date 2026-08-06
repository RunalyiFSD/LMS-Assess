import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import api from '../../services/api';
import {
  Plus,
  Trash2,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Search,
  Filter,
  Upload,
  Download,
  MoreVertical,
  Eye,
  Edit3,
  GraduationCap,
  UserCheck,
  Activity,
  UserPlus,
  ArrowUpRight,
  RefreshCw,
  Mail,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle2,
  Database,
  Server,
  HardDrive,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const AdminDashboardView = () => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'subjects' | 'analytics'

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Growth Chart Timeframe
  const [growthTimeframe, setGrowthTimeframe] = useState('This Week');

  // Form State
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    department: '',
    batch: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get('/users');
      if (userRes.data?.status === 'success') {
        setUsers(userRes.data.data.users || []);
      }

      const subRes = await api.get('/subjects');
      if (subRes.data?.status === 'success') {
        setSubjects(subRes.data.data.subjects || []);
      }
    } catch (err) {
      console.warn('Failed to load administrator resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.college?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesDept =
      !deptFilter ||
      u.department?.toLowerCase() === deptFilter.toLowerCase();
    const matchesBatch = !batchFilter || u.batch === batchFilter;

    // Simulate status matching
    const userStatus = u.status || (u.role === 'admin' ? 'Online' : u.role === 'instructor' ? 'Online' : 'Offline');
    const matchesStatus = !statusFilter || userStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesDept && matchesBatch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Select all checkbox handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(paginatedUsers.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setDeptFilter('');
    setBatchFilter('');
    setStatusFilter('');
  };

  // Open Create / Edit User Modal
  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'student',
      college: '',
      department: '',
      batch: '',
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      college: user.college || '',
      department: user.department || '',
      batch: user.batch || '',
    });
    setShowUserModal(true);
  };

  // Open Detail Modal
  const handleViewUserDetail = (user) => {
    setSelectedUserDetail(user);
    setShowDetailModal(true);
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user from the system?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert('Deletion failed');
    }
  };

  // Submit User Form
  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        const res = await api.put(`/users/${editingUserId}`, payload);
        if (res.data?.status === 'success') {
          setShowUserModal(false);
          fetchAdminData();
        }
      } else {
        const res = await api.post('/users', userForm);
        if (res.data?.status === 'success') {
          setShowUserModal(false);
          fetchAdminData();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  // Export Users CSV
  const handleExportUsersCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Batch', 'College'];
    const csvRows = [headers.join(',')];

    filteredUsers.forEach((u) => {
      csvRows.push(
        `"${u.name || ''}","${u.email || ''}","${u.role || ''}","${u.department || ''}","${u.batch || ''}","${u.college || ''}"`
      );
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Subject
  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject? This might affect assessments.')) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Deletion failed');
    }
  };

  // Submit Subject Form
  const handleCreateSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/subjects', subjectForm);
      if (res.data?.status === 'success') {
        setShowSubjectModal(false);
        setSubjectForm({ name: '', code: '', description: '' });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Creation failed');
    }
  };

  // Metrics Calculations
  const totalUsersCount = users.length;
  const studentCount = users.filter((u) => u.role === 'student').length;
  const instructorCount = users.filter((u) => u.role === 'instructor').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const studentPct = totalUsersCount ? ((studentCount / totalUsersCount) * 100).toFixed(1) : 0;
  const instructorPct = totalUsersCount ? ((instructorCount / totalUsersCount) * 100).toFixed(1) : 0;
  const adminPct = totalUsersCount ? ((adminCount / totalUsersCount) * 100).toFixed(1) : 0;

  const activeTodayCount = Math.max(1, Math.round(totalUsersCount * 0.45));
  const newThisWeekCount = Math.max(1, Math.round(totalUsersCount * 0.12));

  // Extract unique departments & batches for dropdown filters
  const uniqueDepts = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
  const uniqueBatches = Array.from(new Set(users.map((u) => u.batch).filter(Boolean)));

  // Analytics Sparkline & Growth Data
  const sparklineDataPurple = [
    { val: 5 }, { val: 7 }, { val: 6 }, { val: 9 }, { val: 8 }, { val: 11 }, { val: 14 }
  ];
  const sparklineDataGreen = [
    { val: 2 }, { val: 3 }, { val: 3 }, { val: 5 }, { val: 4 }, { val: 6 }, { val: 8 }
  ];
  const sparklineDataBlue = [
    { val: 10 }, { val: 12 }, { val: 15 }, { val: 14 }, { val: 18 }, { val: 20 }, { val: 24 }
  ];

  const userGrowthChartData = [
    { date: 'May 24', users: Math.max(2, Math.round(totalUsersCount * 0.45)) },
    { date: 'May 25', users: Math.max(4, Math.round(totalUsersCount * 0.55)) },
    { date: 'May 26', users: Math.max(5, Math.round(totalUsersCount * 0.65)) },
    { date: 'May 27', users: totalUsersCount || 11 },
    { date: 'May 28', users: Math.max(6, Math.round(totalUsersCount * 0.85)) },
    { date: 'May 29', users: Math.max(8, Math.round(totalUsersCount * 0.92)) },
    { date: 'May 30', users: Math.max(10, Math.round(totalUsersCount * 1.05)) },
  ];

  const rolePieData = [
    { name: 'Students', value: studentCount || 7, color: '#6366F1' },
    { name: 'Instructors', value: instructorCount || 3, color: '#10B981' },
    { name: 'Admins', value: adminCount || 1, color: '#F59E0B' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-slate-400 gap-2">
        <span className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></span>
        Loading administration panel...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── SUB-NAVIGATION TABS HEADER ────────────────────────── */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} />
          User Management
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={16} />
          Course Subjects
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[#4F46E5] text-[#4F46E5]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 size={16} />
          Platform Analytics
        </button>
      </div>

      {/* ── TAB 1: USER MANAGEMENT ────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Top Metric Cards Row (6 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{totalUsersCount.toLocaleString()}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  ↑ 12.5% <span className="text-slate-400 font-normal">from last week</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <GraduationCap size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{studentCount.toLocaleString()}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  ↑ 10.3% <span className="text-slate-400 font-normal">from last week</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserCheck size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Instructors</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{instructorCount.toLocaleString()}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  ↑ 8.2% <span className="text-slate-400 font-normal">from last week</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Shield size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Admins</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{adminCount}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  ↑ 2.1% <span className="text-slate-400 font-normal">from last week</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Activity size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Today</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{activeTodayCount}</p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Users online now</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserPlus size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">New This Week</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{newThisWeekCount}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  ↑ 5.6% <span className="text-slate-400 font-normal">from last week</span>
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid (Left 9 cols / Right 3 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Manage students, instructors, and administrators from one place.
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 mt-2">
                      Showing 1 to {filteredUsers.length} of {totalUsersCount} users
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenCreateUser}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={15} /> + Add User
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={14} /> Import Users
                    </button>
                    <button
                      onClick={handleExportUsersCSV}
                      className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> Export Users
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email or college..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>

                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepts.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Batches</option>
                    {uniqueBatches.map((b, i) => (
                      <option key={i} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Status</option>
                    <option value="Online">Online</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-4 py-3 text-left w-8">
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          USER
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          EMAIL
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          ROLE
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          DEPARTMENT
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          BATCH
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          LAST LOGIN
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-xs">
                            No users match your criteria. Click "Clear" to reset filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u) => {
                          const initials = u.name
                            ? u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                            : 'U';

                          const userStatus = u.status || (u.role === 'admin' ? 'Online' : u.role === 'instructor' ? 'Online' : 'Offline');

                          return (
                            <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(u._id)}
                                  onChange={() => handleSelectOne(u._id)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 ${
                                      u.role === 'instructor'
                                        ? 'bg-blue-600'
                                        : u.role === 'admin'
                                        ? 'bg-purple-600'
                                        : 'bg-emerald-600'
                                    }`}
                                  >
                                    {initials}
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">{u.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                                {u.email}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold">
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-[11px] capitalize border ${
                                    u.role === 'instructor'
                                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                                      : u.role === 'admin'
                                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                                {u.department || '—'}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                                {u.batch || '—'}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      userStatus === 'Online'
                                        ? 'bg-emerald-500'
                                        : userStatus === 'Away'
                                        ? 'bg-amber-500'
                                        : 'bg-slate-300'
                                    }`}
                                  ></span>
                                  <span className="text-slate-700 capitalize">{userStatus}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-400">
                                {u.lastLogin || '2 mins ago'}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-right">
                                <div className="flex items-center justify-end gap-1.5 text-slate-400">
                                  <button
                                    onClick={() => handleViewUserDetail(u)}
                                    title="View User Profile"
                                    className="p-1 hover:text-indigo-600 transition-colors"
                                  >
                                    <Eye size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    title="Edit User"
                                    className="p-1 hover:text-blue-600 transition-colors"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u._id)}
                                    title="Delete User"
                                    className="p-1 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Showing {paginatedUsers.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
                    {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ‹ Prev
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          currentPage === idx + 1
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next ›
                    </button>

                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-xs text-slate-400">Rows per page:</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity size={16} className="text-indigo-600" />
                    Recent Activity
                  </h3>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Priya Sharma</p>
                      <p className="text-slate-400 text-[11px]">Registered as a new student</p>
                      <span className="text-[10px] text-slate-400">2 mins ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Dr. John Instructor</p>
                      <p className="text-slate-400 text-[11px]">Updated profile information</p>
                      <span className="text-[10px] text-slate-400">15 mins ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileSpreadsheet size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">5 new students imported</p>
                      <p className="text-slate-400 text-[11px]">From CSV file upload</p>
                      <span className="text-[10px] text-slate-400">1 hour ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <RefreshCw size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Jay Patel</p>
                      <p className="text-slate-400 text-[11px]">Password reset successful</p>
                      <span className="text-[10px] text-slate-400">2 hours ago</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert('Viewing complete system audit log...')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View All Activity
                </button>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-2">
                  <Layers size={16} className="text-purple-600" />
                  Quick Links
                </h3>

                <button
                  onClick={handleOpenCreateUser}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-left cursor-pointer border border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Shield size={14} className="text-indigo-600" /> Assign Roles
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-left cursor-pointer border border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Upload size={14} className="text-purple-600" /> Import Users (CSV)
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={handleExportUsersCSV}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-left cursor-pointer border border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Download size={14} className="text-emerald-600" /> User Reports
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => alert('Opening Bulk Email Communicator...')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-left cursor-pointer border border-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-600" /> Bulk Email
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COURSE SUBJECTS ────────────────────────── */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Subjects KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-600">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen size={24} />
              </div>
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Registered Subjects</span>
                <p className="text-2xl font-black text-slate-800">{subjects.length} Subjects</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">CS & Software Engineering</span>
                <p className="text-2xl font-black text-slate-800">
                  {subjects.filter((s) => s.code?.startsWith('CS')).length || 4} Subjects
                </p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">IT & Specializations</span>
                <p className="text-2xl font-black text-slate-800">
                  {subjects.filter((s) => !s.code?.startsWith('CS')).length || 4} Subjects
                </p>
              </div>
            </Card>
          </div>

          {/* Subjects Roster Table Card */}
          <Card
            title="Academic Subjects Directory"
            extra={
              <Button size="sm" onClick={() => setShowSubjectModal(true)} className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus size={16} /> Add Subject
              </Button>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Code</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Subject Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Description</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase">Created By</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-xs">
                        No subjects registered yet. Click "Add Subject" to create one.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-indigo-600 uppercase tracking-wider">
                          {s.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                          {s.name}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-sm truncate">
                          {s.description || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                          {s.createdBy?.name ? (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                              {s.createdBy.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Academic Board</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                          <button
                            onClick={() => handleDeleteSubject(s._id)}
                            title="Delete Subject"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          </Card>
        </div>
      )}

      {/* ── TAB 3: PLATFORM ANALYTICS ────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Cards Row (4 Cards matching mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Users */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Users size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL USERS</span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-slate-900">{totalUsersCount}</p>
                  <span className="text-xs text-slate-400 font-medium">Registered</span>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    ↑ 22.2% <span className="text-slate-400 font-normal">from last week</span>
                  </span>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="w-24 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineDataPurple}>
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#7C3AED" strokeWidth={2} fill="url(#purpleGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Active Courses */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <BookOpen size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE COURSES</span>
                </div>
                <div className="pt-2">
                  <p className="text-2xl font-black text-slate-900">{subjects.length}</p>
                  <span className="text-xs text-slate-400 font-medium">Active</span>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    ↑ 5.6% <span className="text-slate-400 font-normal">from last week</span>
                  </span>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="w-24 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineDataGreen}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#10B981" strokeWidth={2} fill="url(#greenGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: Assessments Active */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <BarChart3 size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ASSESSMENTS ACTIVE</span>
                </div>
                <div className="pt-2">
                  <p className="text-xl font-black text-slate-900">Operational</p>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    ↑ 12.5% <span className="text-slate-400 font-normal">from last week</span>
                  </span>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="w-24 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineDataBlue}>
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={2} fill="url(#blueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 4: System Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Shield size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM STATUS</span>
                </div>
                <div className="pt-2">
                  <p className="text-xl font-black text-slate-900">HTTPS Ready</p>
                  <span className="text-xs text-slate-400 font-medium">All systems secure</span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          {/* Main Charts Row (User Growth Overview / Users by Role / System Health) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: User Growth Overview (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">User Growth Overview</h3>
                <select
                  value={growthTimeframe}
                  onChange={(e) => setGrowthTimeframe(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthChartData}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg text-xs space-y-1">
                              <p className="font-bold text-slate-500">{payload[0].payload.date}, 2024</p>
                              <p className="font-extrabold text-purple-700">{payload[0].value} Users</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#growthGrad)"
                      dot={{ r: 4, fill: '#7C3AED', strokeWidth: 2, stroke: '#FFFFFF' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Users by Role (4 cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Users by Role</h3>

              <div className="flex items-center justify-between pt-2">
                {/* Donut Chart with center total */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rolePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {rolePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900">{totalUsersCount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  </div>
                </div>

                {/* Role Breakdown Legend */}
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#6366F1]"></span>
                    <div>
                      <p className="text-slate-800 font-bold">Students</p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {studentCount} ({studentPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                    <div>
                      <p className="text-slate-800 font-bold">Instructors</p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {instructorCount} ({instructorPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                    <div>
                      <p className="text-slate-800 font-bold">Admins</p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {adminCount} ({adminPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: System Health (3 cols) */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">System Health</h3>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Database size={15} className="text-slate-500" /> Database
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Healthy
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Server size={15} className="text-slate-500" /> Server
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Healthy
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <HardDrive size={15} className="text-slate-500" /> Storage
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Healthy
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Mail size={15} className="text-slate-500" /> Email Service
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Healthy
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <RefreshCw size={15} className="text-slate-500" /> Backup
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Up to date
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS SECTION ────────────────────────── */}

      {/* Modal: Create / Edit User */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUserId ? 'Edit User Profile' : 'Add User Account'}
      >
        <form onSubmit={handleSaveUserSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@college.edu"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password {editingUserId && '(Leave blank to keep current)'}
              </label>
              <input
                type="password"
                required={!editingUserId}
                value={userForm.password}
                onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">System Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">College</label>
              <input
                type="text"
                value={userForm.college}
                onChange={(e) => setUserForm((p) => ({ ...p, college: e.target.value }))}
                className="w-full px-3 py-1.5 border rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
              <input
                type="text"
                value={userForm.department}
                onChange={(e) => setUserForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-1.5 border rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Batch Year</label>
              <input
                type="text"
                value={userForm.batch}
                onChange={(e) => setUserForm((p) => ({ ...p, batch: e.target.value }))}
                className="w-full px-3 py-1.5 border rounded text-xs"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {editingUserId ? 'Save Profile Changes' : 'Create User Account'}
          </Button>
        </form>
      </Modal>

      {/* Modal: Add Subject */}
      <Modal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)} title="Add Academic Subject">
        <form onSubmit={handleCreateSubjectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Introduction to Algorithms"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Code</label>
            <input
              type="text"
              required
              value={subjectForm.code}
              onChange={(e) => setSubjectForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. CS-102"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={subjectForm.description}
              onChange={(e) => setSubjectForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Create Subject
          </Button>
        </form>
      </Modal>

      {/* Modal: View Detailed User Profile Summary */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="User Account Summary"
      >
        {selectedUserDetail && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                {selectedUserDetail.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{selectedUserDetail.name}</h4>
                <p className="text-slate-400">{selectedUserDetail.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="font-bold text-slate-400 block uppercase">Role</span>
                <span className="font-semibold text-slate-700 capitalize">{selectedUserDetail.role}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block uppercase">College</span>
                <span className="font-semibold text-slate-700">{selectedUserDetail.college || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block uppercase">Department</span>
                <span className="font-semibold text-slate-700">{selectedUserDetail.department || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block uppercase">Batch</span>
                <span className="font-semibold text-slate-700">{selectedUserDetail.batch || '—'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" onClick={() => setShowDetailModal(false)}>
                Close Summary
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: CSV Batch Import */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Users via CSV"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Upload a standard CSV file containing columns: <code className="bg-slate-100 px-1 rounded">Name, Email, Role, Department, Batch</code>.
          </p>
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
            <Upload size={24} className="text-indigo-600 mb-2" />
            <span className="font-bold text-slate-700">Drag & drop CSV file here</span>
            <span className="text-[11px] text-slate-400 mt-1">or click browse to select file</span>
          </div>

          <Button
            onClick={() => {
              alert('Successfully imported 5 user profiles!');
              setShowImportModal(false);
              fetchAdminData();
            }}
            className="w-full bg-indigo-600 text-white"
          >
            Upload & Process CSV
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboardView;
