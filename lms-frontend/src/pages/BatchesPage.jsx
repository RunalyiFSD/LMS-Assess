import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import api from '../services/api';
import {
  Plus,
  Trash2,
  Users,
  Search,
  Edit3,
  Layers,
  GraduationCap,
  UserCheck,
  Award,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BatchesPage = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Controls
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);

  // Form State
  const [batchForm, setBatchForm] = useState({
    name: '',
    academicYear: '',
    department: 'Computer Science',
    advisor: '',
    status: 'Active',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const batchRes = await api.get('/batches');
      if (batchRes.data?.status === 'success') {
        setBatches(batchRes.data.data.batches || []);
      }

      const userRes = await api.get('/users');
      if (userRes.data?.status === 'success') {
        const allUsers = userRes.data.data.users || [];
        setInstructors(allUsers.filter((u) => u.role === 'instructor'));
      }
    } catch (err) {
      console.warn('Failed to load batch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    const matchesStatus = !statusFilter || b.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.academicYear?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.advisor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Open Modal for Create Batch
  const handleOpenCreateModal = () => {
    setEditingBatchId(null);
    setBatchForm({
      name: '',
      academicYear: '',
      department: 'Computer Science',
      advisor: '',
      status: 'Active',
    });
    setShowBatchModal(true);
  };

  // Open Modal for Edit Batch
  const handleOpenEditModal = (batch) => {
    setEditingBatchId(batch._id);
    setBatchForm({
      name: batch.name || '',
      academicYear: batch.academicYear || '',
      department: batch.department || 'Computer Science',
      advisor: batch.advisor?._id || batch.advisor || '',
      status: batch.status || 'Active',
    });
    setShowBatchModal(true);
  };

  // Delete Batch
  const handleDeleteBatch = async (id, batchName) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;
    try {
      await api.delete(`/batches/${id}`);
      setBatches((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert('Failed to delete batch');
    }
  };

  // Submit Batch Form
  const handleSaveBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBatchId) {
        const res = await api.put(`/batches/${editingBatchId}`, batchForm);
        if (res.data?.status === 'success') {
          setShowBatchModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/batches', batchForm);
        if (res.data?.status === 'success') {
          setShowBatchModal(false);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const totalEnrolledStudents = batches.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const activeBatchesCount = batches.filter((b) => b.status === 'Active').length;

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
                <Layers className="text-indigo-400" size={30} />
                Student Batches Management
              </h1>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Centralized administration over academic graduation years, batch advisors, and active student enrollment counts.
              </p>
            </div>

            <div>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add New Batch
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-600">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers size={24} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Registered Batches</span>
              <p className="text-2xl font-black text-slate-800">{batches.length} Batches</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Cohorts</span>
              <p className="text-2xl font-black text-slate-800">{activeBatchesCount} Active Batches</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Students Across Batches</span>
              <p className="text-2xl font-black text-slate-800">{totalEnrolledStudents} Students</p>
            </div>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search batch by name, year, or advisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                <Filter size={15} />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    BATCH NAME
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ACADEMIC YEAR
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    BATCH ADVISOR
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    STUDENTS
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    STATUS
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
                        <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                        Loading batches...
                      </div>
                    </td>
                  </tr>
                ) : filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No batches found. Click "Add New Batch" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-indigo-600">
                        {b.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                        {b.academicYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {b.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {b.advisor ? (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                            {b.advisor.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100">
                          {b.studentCount || 0} students
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full border ${
                            b.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'Graduated'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => handleOpenEditModal(b)}
                            title="Edit Batch"
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(b._id, b.name)}
                            title="Delete Batch"
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

        {/* Modal: Create / Edit Batch */}
        <Modal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          title={editingBatchId ? 'Edit Academic Batch' : 'Add New Academic Batch'}
        >
          <form onSubmit={handleSaveBatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.name}
                  onChange={(e) => setBatchForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Batch 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Academic Year Duration
                </label>
                <input
                  type="text"
                  required
                  value={batchForm.academicYear}
                  onChange={(e) => setBatchForm((p) => ({ ...p, academicYear: e.target.value }))}
                  placeholder="e.g. 2022 - 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={batchForm.department}
                  onChange={(e) => setBatchForm((p) => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Batch Status
                </label>
                <select
                  value={batchForm.status}
                  onChange={(e) => setBatchForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Batch Advisor / Faculty Lead
              </label>
              <select
                value={batchForm.advisor}
                onChange={(e) => setBatchForm((p) => ({ ...p, advisor: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Unassigned --</option>
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name} ({inst.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
            >
              {editingBatchId ? 'Save Changes' : 'Create Batch'}
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default BatchesPage;
