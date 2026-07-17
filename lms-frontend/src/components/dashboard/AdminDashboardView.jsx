import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import api from '../../services/api';
import { Plus, Trash2, Users, BookOpen, BarChart3, Shield } from 'lucide-react';

const AdminDashboardView = () => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'subjects' | 'analytics'

  // Modal controls
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Forms
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
      console.warn('Failed to load administrator resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  // Create User Submit
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', userForm);
      if (res.data?.status === 'success') {
        setShowUserModal(false);
        setUserForm({ name: '', email: '', password: '', role: 'student', college: '', department: '', batch: '' });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Registration failed');
    }
  };

  // Create Subject Submit
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-slate-400 gap-2">
        <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
        Loading administration panel...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'subjects' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Course Subjects
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'analytics' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Platform Analytics
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <Card
          title="Students & Teachers List"
          extra={
            <Button size="sm" onClick={() => setShowUserModal(true)} className="gap-1">
              <Plus size={16} /> Add User Profile
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">College</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold capitalize">
                      <span className={`px-2 py-0.5 rounded ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                        u.role === 'teacher' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{u.college || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-accent-danger hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Subject Management */}
      {activeTab === 'subjects' && (
        <Card
          title="Academic Subjects"
          extra={
            <Button size="sm" onClick={() => setShowSubjectModal(true)} className="gap-1">
              <Plus size={16} /> Add Subject
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Subject Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {subjects.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-brand-600">{s.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{s.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">{s.description || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <button
                        onClick={() => handleDeleteSubject(s._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-accent-danger hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Platform Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 flex flex-col justify-between">
            <Users className="text-brand-500" size={28} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Total Accounts</span>
              <p className="text-2xl font-black text-slate-800">{users.length} Users</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <BookOpen className="text-emerald-500" size={28} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Active Courses</span>
              <p className="text-2xl font-black text-slate-800">{subjects.length} Subjects</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <BarChart3 className="text-blue-500" size={28} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Assessments Active</span>
              <p className="text-2xl font-black text-slate-800">Ready</p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <Shield className="text-purple-500" size={28} />
            <div className="mt-4">
              <span className="text-slate-400 text-[10px] font-bold uppercase">System Security</span>
              <p className="text-2xl font-black text-slate-800">HTTPS Ready</p>
            </div>
          </Card>
        </div>
      )}

      {/* Modals definitions */}
      {/* Create User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Register User Account">
        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
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
                <option value="teacher">Teacher</option>
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

          <Button type="submit" className="w-full">
            Save User Account
          </Button>
        </form>
      </Modal>

      {/* Create Subject Modal */}
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

          <Button type="submit" className="w-full">
            Create Subject
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardView;
