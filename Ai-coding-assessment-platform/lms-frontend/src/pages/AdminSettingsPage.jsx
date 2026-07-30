import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import {
  Settings,
  Shield,
  Building,
  Sliders,
  Save,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');

  const [settings, setSettings] = useState({
    instituteName: 'Harvard University',
    supportEmail: 'admin@college.edu',
    timeZone: 'IST (GMT+5:30)',
    defaultPassingPercentage: 60,
    maxAttemptRetries: 3,
    timerGracePeriodMinutes: 2,
    sessionTimeoutHours: 8,
    requirePasswordResetDays: 90,
    enablePublicProfiles: true,
    enableAutoGrading: true,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('System settings saved successfully!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} />
            {toastMsg}
          </div>
        )}

        {/* Header Banner */}
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
                <Settings className="text-purple-400" size={30} />
                System Settings & Platform Policies
              </h1>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Configure institution metadata, default assessment pass marks, session timeouts, and security policies.
              </p>
            </div>

            <div>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <Save size={16} /> Save All Settings
              </button>
            </div>
          </div>
        </div>

        {/* System Settings Form */}
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Institution Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Building size={18} className="text-indigo-600" />
              Institution Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={settings.instituteName}
                  onChange={(e) => setSettings((p) => ({ ...p, instituteName: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings((p) => ({ ...p, supportEmail: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">
                  System Timezone
                </label>
                <input
                  type="text"
                  value={settings.timeZone}
                  onChange={(e) => setSettings((p) => ({ ...p, timeZone: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Assessment Policies */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders size={18} className="text-purple-600" />
              Assessment & Test Policies
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">
                  Default Passing Percentage (%)
                </label>
                <input
                  type="number"
                  value={settings.defaultPassingPercentage}
                  onChange={(e) => setSettings((p) => ({ ...p, defaultPassingPercentage: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">
                  Maximum Attempt Retries
                </label>
                <input
                  type="number"
                  value={settings.maxAttemptRetries}
                  onChange={(e) => setSettings((p) => ({ ...p, maxAttemptRetries: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wider">
                  Timer Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.timerGracePeriodMinutes}
                  onChange={(e) => setSettings((p) => ({ ...p, timerGracePeriodMinutes: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminSettingsPage;
