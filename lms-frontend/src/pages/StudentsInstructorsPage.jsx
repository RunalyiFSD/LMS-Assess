import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import api from '../services/api';
import {
  Plus,
  Trash2,
  Users,
  Search,
  Edit3,
  Eye,
  GraduationCap,
  UserCheck,
  Award,
  Filter,
  BookOpen,
  ArrowLeft,
  Download,
  BarChart2,
  TrendingUp,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentsInstructorsPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'instructors'

  // Filtering & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal controls
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Editing state
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // User Form State
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    department: '',
    batch: '',
    experience: '',
    language: '',
    bio: '',
  });

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get('/users');
      if (userRes.data?.status === 'success') {
        setUsers(userRes.data.data.users || []);
      }
    } catch (err) {
      console.warn('Failed to load user roster', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  // Lists
  const studentsList = users.filter((u) => u.role === 'student');
  const instructorsList = users.filter((u) => u.role === 'instructor');

  // Filter options
  const departmentOptions = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
  const batchOptions = Array.from(new Set(studentsList.map((u) => u.batch).filter(Boolean)));

  const getFilteredUsers = (roleType) => {
    return users.filter((u) => {
      const matchesRole = roleType ? u.role === roleType : true;
      const matchesSearch =
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.college?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = !departmentFilter || u.department === departmentFilter;
      const matchesBatch = !batchFilter || u.batch === batchFilter;
      return matchesRole && matchesSearch && matchesDept && matchesBatch;
    });
  };

  const filteredStudents = getFilteredUsers('student');
  const filteredInstructors = getFilteredUsers('instructor');

  // Calculate total tests taken by all students
  const totalTestsTakenCount = studentsList.reduce((acc, curr) => acc + (curr.testsTaken || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    const dataToExport = activeTab === 'students' ? filteredStudents : filteredInstructors;
    if (dataToExport.length === 0) {
      alert('No records to export');
      return;
    }

    const headers =
      activeTab === 'students'
        ? ['Name', 'Email', 'Department', 'Batch Year', 'College', 'Tests Taken']
        : ['Name', 'Email', 'Department', 'Experience', 'Role'];

    const csvRows = [headers.join(',')];

    dataToExport.forEach((u) => {
      const row =
        activeTab === 'students'
          ? [
              `"${u.name || ''}"`,
              `"${u.email || ''}"`,
              `"${u.department || ''}"`,
              `"${u.batch || ''}"`,
              `"${u.college || ''}"`,
              u.testsTaken || 0,
            ]
          : [
              `"${u.name || ''}"`,
              `"${u.email || ''}"`,
              `"${u.department || ''}"`,
              `"${u.experience || ''}"`,
              `"${u.role || ''}"`,
            ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Modal for Create User
  const handleOpenCreateModal = (defaultRole = 'student') => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: defaultRole,
      college: '',
      department: '',
      batch: '',
      experience: '',
      language: '',
      bio: '',
    });
    setShowUserModal(true);
  };

  // Open Modal for Edit User
  const handleOpenEditModal = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      college: user.college || '',
      department: user.department || '',
      batch: user.batch || '',
      experience: user.experience || '',
      language: user.language || '',
      bio: user.bio || '',
    });
    setShowUserModal(true);
  };

  // View Detailed Profile Modal
  const handleViewUserDetail = async (userId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await api.get(`/users/${userId}`);
      if (res.data?.status === 'success') {
        setSelectedUserDetail(res.data.data);
      }
    } catch (err) {
      alert('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to remove user account "${userName}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  // Submit User Form (Create / Update)
  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const res = await api.put(`/users/${editingUserId}`, userForm);
        if (res.data?.status === 'success') {
          setShowUserModal(false);
          fetchUsersData();
        }
      } else {
        const res = await api.post('/users', userForm);
        if (res.data?.status === 'success') {
          setShowUserModal(false);
          fetchUsersData();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  // Avatar colors
  const avatarBgColors = [
    'bg-purple-100 text-purple-700',
    'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header Banner - Matching Exact Screenshot Design */}
        <div className="relative overflow-hidden bg-[#121038] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-950">
          {/* Subtle background vector circles overlay */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <div className="w-64 h-64 border-4 border-indigo-400 rounded-full flex items-center justify-center">
              <div className="w-40 h-40 border-4 border-indigo-300 rounded-full"></div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors mb-1"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Students & Instructors Management
              </h1>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Comprehensive user administration roster. Create accounts, assign department roles, update profiles, and track performance.
              </p>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenCreateModal('student')}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Student
              </button>

              <button
                onClick={() => handleOpenCreateModal('instructor')}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Instructor
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs - Matching Screenshot */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('students');
              setSearchQuery('');
              setDepartmentFilter('');
              setBatchFilter('');
            }}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'students'
                ? 'border-[#7C3AED] text-[#7C3AED] bg-purple-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={18} />
            Students Roster ({studentsList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('instructors');
              setSearchQuery('');
              setDepartmentFilter('');
              setBatchFilter('');
            }}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'instructors'
                ? 'border-[#7C3AED] text-[#7C3AED] bg-purple-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={18} />
            Instructors Roster ({instructorsList.length})
          </button>
        </div>

        {/* Tab 1: Students Roster View */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* KPI Cards Row (4 Cards) - Exact Screenshot Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Enrolled Students */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100/80 text-purple-600 rounded-2xl flex items-center justify-center">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL ENROLLED STUDENTS
                    </span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">
                      {studentsList.length} <span className="text-sm font-bold text-slate-600">Students</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-purple-600 font-semibold flex items-center gap-1">
                  <span>↑ 12% from last month</span>
                </div>
              </div>

              {/* Card 2: Active Batches */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100/80 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Users size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ACTIVE BATCHES
                    </span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">
                      {batchOptions.length || 4} <span className="text-sm font-bold text-slate-600">Batches</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span>↑ 8% from last month</span>
                </div>
              </div>

              {/* Card 3: Departments */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100/80 text-blue-600 rounded-2xl flex items-center justify-center">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      DEPARTMENTS
                    </span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">
                      {departmentOptions.length || 5} <span className="text-sm font-bold text-slate-600">Departments</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium flex items-center gap-1">
                  <span>— No change</span>
                </div>
              </div>

              {/* Card 4: Total Tests Taken */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100/80 text-amber-600 rounded-2xl flex items-center justify-center">
                    <BarChart2 size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL TESTS TAKEN
                    </span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">
                      {totalTestsTakenCount || 15} <span className="text-sm font-bold text-slate-600">Tests</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-amber-600 font-semibold flex items-center gap-1">
                  <span>↑ 15% from last month</span>
                </div>
              </div>
            </div>

            {/* Filter Bar & Action Row */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student by name, email, or college..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Filter Controls & Export */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                    <Filter size={15} />
                  </div>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Departments</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Batches</option>
                    {batchOptions.map((b) => (
                      <option key={b} value={b}>
                        Batch {b}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} /> Export
                  </button>
                </div>
              </div>
            </div>

            {/* Students Table - Exact Screenshot Style */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        STUDENT NAME
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        DEPARTMENT
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        BATCH YEAR
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        COLLEGE
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        TESTS TAKEN
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
                            Loading student roster...
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => {
                        const avatarBg = avatarBgColors[idx % avatarBgColors.length];
                        return (
                          <tr key={st._id} className="hover:bg-slate-50/60 transition-colors">
                            {/* Name with initials circle and active status dot */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div
                                    className={`w-8 h-8 rounded-full ${avatarBg} font-bold text-xs flex items-center justify-center`}
                                  >
                                    {st.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>
                                <span className="text-xs font-bold text-slate-800">{st.name}</span>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-normal">
                              {st.email}
                            </td>

                            {/* Department */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                              {st.department || 'CS'}
                            </td>

                            {/* Batch Year */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[#4F46E5]">
                              {st.batch ? `Batch ${st.batch}` : 'Batch 2024'}
                            </td>

                            {/* College */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                              {st.college || '—'}
                            </td>

                            {/* Tests Taken Pill Badge */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                              <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                {st.testsTaken || 0} tests
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                              <div className="flex items-center justify-end gap-2 text-slate-400">
                                <button
                                  onClick={() => handleViewUserDetail(st._id)}
                                  title="View Details"
                                  className="p-1 hover:text-purple-600 transition-colors"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(st)}
                                  title="Edit Profile"
                                  className="p-1 hover:text-blue-600 transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(st._id, st.name)}
                                  title="Delete Account"
                                  className="p-1 hover:text-red-600 transition-colors"
                                >
                                  <MoreVertical size={16} />
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

              {/* Table Footer Pagination */}
              <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <span>
                  Showing 1 to {filteredStudents.length} of {studentsList.length} students
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="px-3 py-1.5 text-slate-400 bg-slate-100 rounded-lg text-xs font-medium cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    1
                  </span>
                  <button
                    disabled
                    className="px-3 py-1.5 text-slate-400 bg-slate-100 rounded-lg text-xs font-medium cursor-not-allowed flex items-center gap-1"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 font-medium focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Instructors Roster View - Exact Second Screenshot Layout */}
        {activeTab === 'instructors' && (
          <div className="space-y-6">
            {/* KPI Cards Row (3 Cards) - Matching Screenshot 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Card 1: Total Instructors */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100/80 text-purple-600 rounded-2xl flex items-center justify-center">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL INSTRUCTORS
                    </span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">
                      {instructorsList.length} <span className="text-sm font-bold text-slate-600">Faculty</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-purple-600 font-semibold flex items-center gap-1">
                  <span>↑ 20% from last month</span>
                </div>
              </div>

              {/* Card 2: Active Departments */}
              <div className="p-5 bg-white border-2 border-blue-500/80 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100/80 text-blue-600 rounded-2xl flex items-center justify-center">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ACTIVE DEPARTMENTS
                    </span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">
                      {departmentOptions.length || 5} <span className="text-sm font-bold text-slate-600">Departments</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium flex items-center gap-1">
                  <span>— No change</span>
                </div>
              </div>

              {/* Card 3: Faculty Status */}
              <div className="p-5 bg-white border-2 border-emerald-500/80 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100/80 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Award size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      FACULTY STATUS
                    </span>
                    <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                      Active Tutors
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>100% Active</span>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search instructor by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                    <Filter size={15} />
                  </div>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Departments</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Instructors Table - Screenshot 2 Style */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        INSTRUCTOR NAME
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        DEPARTMENT
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        EXPERIENCE
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ROLE BADGE
                      </th>
                      <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                          <div className="flex justify-center items-center gap-2">
                            <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                            Loading instructor roster...
                          </div>
                        </td>
                      </tr>
                    ) : filteredInstructors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                          No instructors found.
                        </td>
                      </tr>
                    ) : (
                      filteredInstructors.map((inst, idx) => {
                        const avatarBg = avatarBgColors[idx % avatarBgColors.length];
                        return (
                          <tr key={inst._id} className="hover:bg-slate-50/60 transition-colors">
                            {/* Name */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div
                                    className={`w-8 h-8 rounded-full ${avatarBg} font-bold text-xs flex items-center justify-center`}
                                  >
                                    {inst.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>
                                <span className="text-xs font-bold text-slate-800">{inst.name}</span>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-normal">
                              {inst.email}
                            </td>

                            {/* Department */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                              {inst.department || 'Computer Science'}
                            </td>

                            {/* Experience */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-normal">
                              {inst.experience || 'Faculty Member'}
                            </td>

                            {/* Role Badge */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                              <span className="px-3 py-1 text-[11px] font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                                Instructor
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                              <div className="flex items-center justify-end gap-2 text-slate-400">
                                <button
                                  onClick={() => handleViewUserDetail(inst._id)}
                                  title="View Details"
                                  className="p-1 hover:text-purple-600 transition-colors"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(inst)}
                                  title="Edit Profile"
                                  className="p-1 hover:text-blue-600 transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(inst._id, inst.name)}
                                  title="Delete Account"
                                  className="p-1 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(inst._id, inst.name)}
                                  className="p-1 hover:text-slate-600 transition-colors"
                                >
                                  <MoreVertical size={16} />
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

              {/* Table Footer Pagination */}
              <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <span>
                  Showing 1 to {filteredInstructors.length} of {instructorsList.length} instructors
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="px-3 py-1.5 text-slate-400 bg-slate-100 rounded-lg text-xs font-medium cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    1
                  </span>
                  <button
                    disabled
                    className="px-3 py-1.5 text-slate-400 bg-slate-100 rounded-lg text-xs font-medium cursor-not-allowed flex items-center gap-1"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 font-medium focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create or Edit User */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title={editingUserId ? 'Edit User Account' : 'Register New User Account'}
        >
          <form onSubmit={handleSaveUserSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@college.edu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Password {editingUserId && <span className="text-slate-400 font-normal lowercase">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={userForm.password}
                  onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={editingUserId ? '••••••••' : 'Enter password'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">System Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-semibold text-slate-700 capitalize focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">College / Institute</label>
                <input
                  type="text"
                  value={userForm.college}
                  onChange={(e) => setUserForm((p) => ({ ...p, college: e.target.value }))}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm((p) => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. CS"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              {userForm.role === 'student' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Batch Year</label>
                  <input
                    type="text"
                    value={userForm.batch}
                    onChange={(e) => setUserForm((p) => ({ ...p, batch: e.target.value }))}
                    placeholder="e.g. 2026"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Experience Level</label>
                  <input
                    type="text"
                    value={userForm.experience}
                    onChange={(e) => setUserForm((p) => ({ ...p, experience: e.target.value }))}
                    placeholder="e.g. Faculty Member"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Bio / Profile Notes</label>
              <textarea
                rows={2}
                value={userForm.bio}
                onChange={(e) => setUserForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Short notes or summary..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-lg shadow-purple-500/20 transition-all"
            >
              {editingUserId ? 'Save Account Changes' : 'Create User Account'}
            </button>
          </form>
        </Modal>

        {/* Modal: View User Details */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="User Profile Summary">
          {detailLoading ? (
            <div className="py-8 flex justify-center items-center text-slate-400 text-xs gap-2">
              <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
              Fetching user statistics...
            </div>
          ) : selectedUserDetail?.user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED] text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedUserDetail.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">{selectedUserDetail.user.name}</h4>
                  <p className="text-xs text-slate-500">{selectedUserDetail.user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-100 text-purple-700">
                      {selectedUserDetail.user.role}
                    </span>
                    {selectedUserDetail.user.department && (
                      <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-200 text-slate-700">
                        {selectedUserDetail.user.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                  <span className="text-slate-400 font-medium block">College / Institute</span>
                  <span className="font-semibold text-slate-700">{selectedUserDetail.user.college || 'Not specified'}</span>
                </div>
                {selectedUserDetail.user.role === 'student' ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="text-slate-400 font-medium block">Batch Year</span>
                    <span className="font-semibold text-slate-700">{selectedUserDetail.user.batch || 'Unassigned'}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="text-slate-400 font-medium block">Experience</span>
                    <span className="font-semibold text-slate-700">{selectedUserDetail.user.experience || 'Faculty Member'}</span>
                  </div>
                )}
              </div>

              {selectedUserDetail.user.role === 'student' && selectedUserDetail.stats && (
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                  <h5 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Performance Metrics</h5>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold block">Assessments</span>
                      <span className="text-lg font-black text-slate-800">{selectedUserDetail.stats.totalAttempts || 0}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold block">Pass Count</span>
                      <span className="text-lg font-black text-emerald-600">{selectedUserDetail.stats.passCount || 0}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold block">Avg Score</span>
                      <span className="text-lg font-black text-[#4F46E5]">{selectedUserDetail.stats.avgPercentage || 0}%</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedUserDetail.user.role === 'instructor' && selectedUserDetail.stats && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Instructor Summary</h5>
                  <div className="p-3 bg-white rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-medium text-slate-600">Created Assessments</span>
                    <span className="text-base font-black text-blue-600">
                      {selectedUserDetail.stats.createdAssessmentsCount || 0} Tests
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      </div>
    </Layout>
  );
};

export default StudentsInstructorsPage;
