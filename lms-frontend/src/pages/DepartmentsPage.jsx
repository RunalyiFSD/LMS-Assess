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
  Building2,
  GraduationCap,
  UserCheck,
  Award,
  Filter,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Controls
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);

  // Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const deptRes = await api.get('/departments');
      if (deptRes.data?.status === 'success') {
        setDepartments(deptRes.data.data.departments || []);
      }

      const userRes = await api.get('/users');
      if (userRes.data?.status === 'success') {
        const allUsers = userRes.data.data.users || [];
        setInstructors(allUsers.filter((u) => u.role === 'instructor'));
        setStudents(allUsers.filter((u) => u.role === 'student'));
      }
    } catch (err) {
      console.warn('Failed to load departments data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Departments
  const filteredDepartments = departments.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.headOfDepartment?.name?.toLowerCase().includes(q)
    );
  });

  // Open Modal for Create Department
  const handleOpenCreateDeptModal = () => {
    setEditingDeptId(null);
    setDeptForm({ name: '', code: '', description: '', headOfDepartment: '' });
    setShowDeptModal(true);
  };

  // Open Modal for Edit Department
  const handleOpenEditDeptModal = (dept) => {
    setEditingDeptId(dept._id);
    setDeptForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      headOfDepartment: dept.headOfDepartment?._id || dept.headOfDepartment || '',
    });
    setShowDeptModal(true);
  };

  // Delete Department
  const handleDeleteDepartment = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to delete department "${deptName}"?`)) return;
    try {
      await api.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  // Submit Department Form
  const handleSaveDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDeptId) {
        const res = await api.put(`/departments/${editingDeptId}`, deptForm);
        if (res.data?.status === 'success') {
          setShowDeptModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/departments', deptForm);
        if (res.data?.status === 'success') {
          setShowDeptModal(false);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const totalHODsCount = departments.filter((d) => d.headOfDepartment).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden bg-[#121038] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-950">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors mb-1"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Building2 className="text-purple-400" size={30} />
                Departments Management
              </h1>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Central control over academic departments, department codes, Head of Department (HOD) faculty assignments, and dynamic student/instructor counts.
              </p>
            </div>

            <div>
              <button
                onClick={handleOpenCreateDeptModal}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Department
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Departments</span>
              <p className="text-2xl font-black text-slate-800">{departments.length} Academic Depts</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck size={24} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Assigned HODs</span>
              <p className="text-2xl font-black text-slate-800">{totalHODsCount} Department Heads</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Enrolled Students</span>
              <p className="text-2xl font-black text-slate-800">{students.length} Students</p>
            </div>
          </Card>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search department by code, name, or HOD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Departments Roster Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    CODE
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    DEPARTMENT NAME
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    HEAD OF DEPARTMENT (HOD)
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    STUDENTS
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    FACULTY
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
                        Loading departments...
                      </div>
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No departments found. Click "Add Department" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-purple-600 uppercase tracking-wider">
                        {dept.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-800">{dept.name}</div>
                        {dept.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{dept.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {dept.headOfDepartment ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100">
                            {dept.headOfDepartment.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {dept.studentCount || 0} enrolled
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {dept.instructorCount || 0} tutors
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => handleOpenEditDeptModal(dept)}
                            title="Edit Department"
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                            title="Delete Department"
                            className="p-1 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create / Edit Department */}
        <Modal
          isOpen={showDeptModal}
          onClose={() => setShowDeptModal(false)}
          title={editingDeptId ? 'Edit Academic Department' : 'Add Academic Department'}
        >
          <form onSubmit={handleSaveDeptSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. CSE"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white uppercase focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Head of Department (HOD)
              </label>
              <select
                value={deptForm.headOfDepartment}
                onChange={(e) => setDeptForm((p) => ({ ...p, headOfDepartment: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">-- Unassigned --</option>
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name} ({inst.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <textarea
                rows={3}
                value={deptForm.description}
                onChange={(e) => setDeptForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Department syllabus overview or department mission..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-lg shadow-purple-500/20 transition-all"
            >
              {editingDeptId ? 'Save Changes' : 'Create Department'}
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default DepartmentsPage;
