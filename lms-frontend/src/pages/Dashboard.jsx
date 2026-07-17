import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';
import TeacherDashboardView from '../components/dashboard/TeacherDashboardView';
import StudentDashboardView from '../components/dashboard/StudentDashboardView';
import Button from '../components/common/Button';
import api from '../services/api';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  // Sync active tab state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);

  const [profileForm, setProfileForm] = useState({
    name: '',
    college: '',
    department: '',
    batch: '',
    bio: '',
    profilePicture: '',
  });

  const [updating, setUpdating] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync state when user profile is fetched / hydrated
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        college: user.college || '',
        department: user.department || '',
        batch: user.batch || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data?.status === 'success') {
        setUser(res.data.data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  // Dynamic dashboard view dispatch based on user's authorized role
  const renderDashboardView = () => {
    if (user?.role === 'admin') {
      return <AdminDashboardView />;
    }
    if (user?.role === 'teacher') {
      return <TeacherDashboardView />;
    }
    return <StudentDashboardView />;
  };

  const renderProfileEditForm = () => {
    return (
      <div className="max-w-2xl bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center font-black font-mono text-xl overflow-hidden shadow-sm">
              {profileForm.profilePicture ? (
                <img src={profileForm.profilePicture} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
              )}
            </div>
            <label
              htmlFor="avatar-file-input"
              className="absolute -bottom-1 -right-1 bg-brand-500 hover:bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-sm transition-transform hover:scale-110 active:scale-95"
              title="Upload profile picture"
            >
              <Plus size={12} />
            </label>
            <input
              type="file"
              id="avatar-file-input"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Edit Account Profile Details</h3>
            <p className="text-xs text-slate-500">Update your avatar, institution details, and bio info.</p>
            {profileForm.profilePicture && (
              <button
                type="button"
                onClick={() => setProfileForm((prev) => ({ ...prev, profilePicture: '' }))}
                className="mt-1.5 text-[11px] font-bold text-red-500 hover:text-red-750 transition-colors flex items-center gap-1"
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
              Profile updated successfully!
            </div>
          )}
          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 text-accent-danger rounded-lg text-xs font-semibold">
              {profileError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* URL input field removed, replaced by click-to-upload button overlay */}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">College/Univ</label>
              <input
                type="text"
                value={profileForm.college}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, college: e.target.value }))}
                placeholder="e.g. MIT"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            {user?.role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Batch Year</label>
                <input
                  type="text"
                  value={profileForm.batch}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, batch: e.target.value }))}
                  placeholder="e.g. 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Short Biography Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="w-full h-24 p-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-brand-500"
            />
          </div>

          <Button type="submit" disabled={updating} className="w-full py-2.5">
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving Updates...
              </span>
            ) : (
              'Save Profile Changes'
            )}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">
            Your analytical {user?.role || 'Student'} workspace hub is ready.
          </p>
        </div>
      </div>

      {/* Elegant glassmorphic tabs row */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'dashboard'
              ? 'text-brand-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Dashboard Workspace
          {activeTab === 'dashboard' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'profile'
              ? 'text-brand-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Edit Profile Settings
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'dashboard' ? renderDashboardView() : renderProfileEditForm()}
      </div>
    </Layout>
  );
};

export default Dashboard;
