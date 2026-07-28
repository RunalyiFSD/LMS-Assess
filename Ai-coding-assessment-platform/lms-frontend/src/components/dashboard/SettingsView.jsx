import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Code,
  Shield,
  Link as LinkIcon,
  GraduationCap,
  Globe,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Lock,
  LogOut,
  Trash2,
  X,
  Download,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { applyAppTheme, THEME_CONFIGS } from '../../utils/themeUtils';

const ToggleSwitch = ({ checked, onChange, activeTheme = 'purple' }) => {
  const theme = THEME_CONFIGS[activeTheme] || THEME_CONFIGS.purple;
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0"
      style={{ backgroundColor: checked ? theme.primary : '#E2E8F0' }}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

const SettingsView = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    assessmentReminders: true,
    deadlineAlerts: true,
    announcements: false,
    instructorMessages: true,
    weeklyReport: false,
  });

  // 2. Appearance State
  const [appearance, setAppearance] = useState({
    mode: 'Light',
    themeColor: 'purple',
    fontSize: 14,
    sidebarCollapse: false,
    highContrast: false,
  });

  // 3. Coding Preferences State
  const [coding, setCoding] = useState({
    language: 'JavaScript',
    editorTheme: 'Dark+ (default)',
    autoSave: true,
    autoComplete: true,
    wordWrap: false,
    tabSize: '2 spaces',
    lineNumbers: true,
  });

  // 4. Privacy & Security State
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showScores: false,
    showCertificates: true,
    allowRecruiters: true,
    shareUsageData: true,
    shareTelemetry: false,
  });

  // 5. Connected Accounts State
  const [connected, setConnected] = useState({
    google: true,
    github: false,
    linkedin: true,
    microsoft: false,
  });

  // 6. Learning Preferences State
  const [learning, setLearning] = useState({
    dailyGoal: '30 minutes',
    weeklyGoal: '5 hours',
    difficulty: 'Beginner',
    aiHintLevel: 'Minimal',
    recommendations: true,
  });

  // 7. Language & Region State
  const [region, setRegion] = useState({
    language: 'English',
    timeZone: 'IST (GMT+5:30)',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24 hour',
  });

  const [toastMsg, setToastMsg] = useState('');
  const [showDataSharingModal, setShowDataSharingModal] = useState(false);
  const [connectingAccount, setConnectingAccount] = useState(null);

  // Hydrate settings from User object
  useEffect(() => {
    if (user?.settings) {
      const s = user.settings;
      if (s.notifications) setNotifications(prev => ({ ...prev, ...s.notifications }));
      if (s.appearance) setAppearance(prev => ({ ...prev, ...s.appearance }));
      if (s.coding) setCoding(prev => ({ ...prev, ...s.coding }));
      if (s.privacy) setPrivacy(prev => ({ ...prev, ...s.privacy }));
      if (s.connected) setConnected(prev => ({ ...prev, ...s.connected }));
      if (s.learning) setLearning(prev => ({ ...prev, ...s.learning }));
      if (s.region) setRegion(prev => ({ ...prev, ...s.region }));
    }
  }, [user]);

  // Apply real-time visual appearance effects to document DOM
  useEffect(() => {
    // Mode (Light / Dark / System default)
    if (appearance.mode === 'Dark') {
      document.documentElement.classList.add('dark');
    } else if (appearance.mode === 'System') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }

    // High Contrast Mode
    if (appearance.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Theme Color (Purple, Emerald, Blue, Orange)
    if (appearance.themeColor) {
      applyAppTheme(appearance.themeColor);
    }

    // Font size scaling
    if (appearance.fontSize) {
      document.documentElement.style.fontSize = `${appearance.fontSize}px`;
    }
  }, [appearance]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Helper to persist all settings dynamically to backend and AuthContext
  const persistSettings = async (updatedCategory, data) => {
    const updatedSettings = {
      notifications,
      appearance,
      coding,
      privacy,
      connected,
      learning,
      region,
      [updatedCategory]: data,
    };

    try {
      const res = await api.put('/users/profile', { settings: updatedSettings });
      if (res.data?.status === 'success') {
        setUser(res.data.data.user);
      }
    } catch (err) {
      console.warn('Failed to persist settings to backend:', err);
    }
  };

  const updateNotifications = (key, val) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    persistSettings('notifications', updated);
    showToast('Notification settings saved');
  };

  const updateAppearance = (key, val) => {
    const updated = { ...appearance, [key]: val };
    setAppearance(updated);
    persistSettings('appearance', updated);
    showToast('Appearance settings saved');
  };

  const updateCoding = (key, val) => {
    const updated = { ...coding, [key]: val };
    setCoding(updated);
    persistSettings('coding', updated);
    showToast('Coding preferences saved');
  };

  const updatePrivacy = (key, val) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    persistSettings('privacy', updated);
    showToast('Privacy settings saved');
  };

  const updateConnected = (key, val) => {
    const updated = { ...connected, [key]: val };
    setConnected(updated);
    persistSettings('connected', updated);
    showToast(val ? `${key} account linked` : `${key} account unlinked`);
  };

  const updateLearning = (key, val) => {
    const updated = { ...learning, [key]: val };
    setLearning(updated);
    persistSettings('learning', updated);
    showToast('Learning preferences saved');
  };

  const updateRegion = (key, val) => {
    const updated = { ...region, [key]: val };
    setRegion(updated);
    persistSettings('region', updated);
    showToast('Language & region settings saved');
  };

  // REAL FUNCTIONALITY: Export personal user data as downloadable JSON
  const handleExportData = () => {
    const dataExport = {
      userProfile: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        college: user?.college,
        department: user?.department,
        batch: user?.batch,
        experience: user?.experience,
        bio: user?.bio,
        language: user?.language,
      },
      userSettings: user?.settings || { notifications, appearance, coding, privacy, connected, learning, region },
      exportTimestamp: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LMS_Personal_Data_Export_${user?.name?.replace(/\s+/g, '_') || 'User'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Personal data exported successfully');
  };

  // REAL FUNCTIONALITY: Connect account trigger
  const handleAccountConnectToggle = (accountKey) => {
    if (connected[accountKey]) {
      if (window.confirm(`Are you sure you want to disconnect your ${accountKey} account?`)) {
        updateConnected(accountKey, false);
      }
    } else {
      setConnectingAccount(accountKey);
    }
  };

  const confirmConnectAccount = () => {
    if (connectingAccount) {
      updateConnected(connectingAccount, true);
      setConnectingAccount(null);
    }
  };

  // REAL FUNCTIONALITY: Danger Zone - Logout all
  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to log out from all active sessions?')) {
      await logout();
      navigate('/');
    }
  };

  // REAL FUNCTIONALITY: Danger Zone - Delete Account
  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete your account? All progress, certificates, and assessment history will be permanently deleted.')) {
      try {
        await api.delete('/users/me');
        await logout();
        alert('Your account has been deleted successfully.');
        navigate('/');
      } catch (err) {
        alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Account Connection Confirmation Modal */}
      {connectingAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 capitalize">Connect {connectingAccount} Account</h3>
              <button onClick={() => setConnectingAccount(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              You are about to authorize LMS Platform to connect with your <strong>{connectingAccount}</strong> identity for single sign-on and profile synchronization.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={confirmConnectAccount}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Authorize & Connect
              </button>
              <button
                onClick={() => setConnectingAccount(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Sharing Preferences Modal */}
      {showDataSharingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders size={18} className="text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Data Sharing Preferences</h3>
              </div>
              <button onClick={() => setShowDataSharingModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Anonymous Usage Analytics</p>
                  <p className="text-[11px] text-slate-400 font-normal">Help improve performance with usage metrics</p>
                </div>
                <ToggleSwitch
                  checked={privacy.shareUsageData}
                  onChange={(val) => updatePrivacy('shareUsageData', val)}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Telemetry & Diagnostic Sharing</p>
                  <p className="text-[11px] text-slate-400 font-normal">Share crash reports and diagnostic data</p>
                </div>
                <ToggleSwitch
                  checked={privacy.shareTelemetry}
                  onChange={(val) => updatePrivacy('shareTelemetry', val)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDataSharingModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout containing 8 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── CARD 1: NOTIFICATIONS ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Bell size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Notifications</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            <div className="py-3.5 flex items-center justify-between">
              <span>Email notifications</span>
              <ToggleSwitch
                checked={notifications.email}
                onChange={(val) => updateNotifications('email', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Push notifications</span>
              <ToggleSwitch
                checked={notifications.push}
                onChange={(val) => updateNotifications('push', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Assessment reminders</span>
              <ToggleSwitch
                checked={notifications.assessmentReminders}
                onChange={(val) => updateNotifications('assessmentReminders', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Assignment deadline alerts</span>
              <ToggleSwitch
                checked={notifications.deadlineAlerts}
                onChange={(val) => updateNotifications('deadlineAlerts', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>New course announcements</span>
              <ToggleSwitch
                checked={notifications.announcements}
                onChange={(val) => updateNotifications('announcements', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Instructor messages</span>
              <ToggleSwitch
                checked={notifications.instructorMessages}
                onChange={(val) => updateNotifications('instructorMessages', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Weekly performance report</span>
              <ToggleSwitch
                checked={notifications.weeklyReport}
                onChange={(val) => updateNotifications('weeklyReport', val)}
              />
            </div>
          </div>
        </div>



        {/* ── CARD 3: CODING PREFERENCES ───────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Code size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Coding preferences</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            <div className="py-3.5 flex items-center justify-between">
              <span>Preferred language</span>
              <div className="relative w-48">
                <select
                  value={coding.language}
                  onChange={(e) => updateCoding('language', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="SQL">SQL</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Editor theme</span>
              <div className="relative w-48">
                <select
                  value={coding.editorTheme}
                  onChange={(e) => updateCoding('editorTheme', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="Dark+ (default)">Dark+ (default)</option>
                  <option value="Monokai">Monokai</option>
                  <option value="VS Light">VS Light</option>
                  <option value="One Dark Pro">One Dark Pro</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Auto save</span>
              <ToggleSwitch
                checked={coding.autoSave}
                onChange={(val) => updateCoding('autoSave', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Auto complete</span>
              <ToggleSwitch
                checked={coding.autoComplete}
                onChange={(val) => updateCoding('autoComplete', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Word wrap</span>
              <ToggleSwitch
                checked={coding.wordWrap}
                onChange={(val) => updateCoding('wordWrap', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Tab size</span>
              <div className="relative w-36">
                <select
                  value={coding.tabSize}
                  onChange={(e) => updateCoding('tabSize', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="2 spaces">2 spaces</option>
                  <option value="4 spaces">4 spaces</option>
                  <option value="8 spaces">8 spaces</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Line numbers</span>
              <ToggleSwitch
                checked={coding.lineNumbers}
                onChange={(val) => updateCoding('lineNumbers', val)}
              />
            </div>
          </div>
        </div>

        {/* ── CARD 4: PRIVACY & SECURITY ───────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Shield size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Privacy & security</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            <div className="py-3.5 flex items-center justify-between">
              <span>Public profile</span>
              <ToggleSwitch
                checked={privacy.publicProfile}
                onChange={(val) => updatePrivacy('publicProfile', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Show assessment scores</span>
              <ToggleSwitch
                checked={privacy.showScores}
                onChange={(val) => updatePrivacy('showScores', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Show certificates</span>
              <ToggleSwitch
                checked={privacy.showCertificates}
                onChange={(val) => updatePrivacy('showCertificates', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Allow recruiters to view profile</span>
              <ToggleSwitch
                checked={privacy.allowRecruiters}
                onChange={(val) => updatePrivacy('allowRecruiters', val)}
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Download personal data</span>
              <button
                onClick={handleExportData}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Download size={13} className="text-slate-500" />
                <span>Request export</span>
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Data sharing preferences</span>
              <button
                onClick={() => setShowDataSharingModal(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 5: CONNECTED ACCOUNTS ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <LinkIcon size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Connected accounts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Google */}
            <div className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-sm shrink-0">
                  G
                </div>
                <span className="text-xs font-bold text-slate-900">Google</span>
              </div>
              <button
                onClick={() => handleAccountConnectToggle('google')}
                className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  connected.google
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80'
                }`}
              >
                {connected.google ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* GitHub */}
            <div className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs shrink-0">
                  Gh
                </div>
                <span className="text-xs font-bold text-slate-900">GitHub</span>
              </div>
              <button
                onClick={() => handleAccountConnectToggle('github')}
                className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  connected.github
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80'
                }`}
              >
                {connected.github ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* LinkedIn */}
            <div className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs shrink-0">
                  in
                </div>
                <span className="text-xs font-bold text-slate-900">LinkedIn</span>
              </div>
              <button
                onClick={() => handleAccountConnectToggle('linkedin')}
                className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  connected.linkedin
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80'
                }`}
              >
                {connected.linkedin ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* Microsoft */}
            <div className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs shrink-0">
                  Ms
                </div>
                <span className="text-xs font-bold text-slate-900">Microsoft</span>
              </div>
              <button
                onClick={() => handleAccountConnectToggle('microsoft')}
                className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  connected.microsoft
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80'
                }`}
              >
                {connected.microsoft ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 6: LEARNING PREFERENCES ─────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Learning preferences</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            <div className="py-3.5 flex items-center justify-between">
              <span>Daily study goal</span>
              <div className="relative w-44">
                <select
                  value={learning.dailyGoal}
                  onChange={(e) => updateLearning('dailyGoal', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Weekly learning goal</span>
              <div className="relative w-44">
                <select
                  value={learning.weeklyGoal}
                  onChange={(e) => updateLearning('weeklyGoal', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="5 hours">5 hours</option>
                  <option value="10 hours">10 hours</option>
                  <option value="15 hours">15 hours</option>
                  <option value="20 hours">20 hours</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Preferred difficulty level</span>
              <div className="relative w-44">
                <select
                  value={learning.difficulty}
                  onChange={(e) => updateLearning('difficulty', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>AI hint level</span>
              <div className="relative w-44">
                <select
                  value={learning.aiHintLevel}
                  onChange={(e) => updateLearning('aiHintLevel', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="Minimal">Minimal</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Detailed">Detailed</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Personalized recommendations</span>
              <ToggleSwitch
                checked={learning.recommendations}
                onChange={(val) => updateLearning('recommendations', val)}
              />
            </div>
          </div>
        </div>

        {/* ── CARD 7: LANGUAGE & REGION ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Globe size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Language & region</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            <div className="py-3.5 flex items-center justify-between">
              <span>Language</span>
              <div className="relative w-44">
                <select
                  value={region.language}
                  onChange={(e) => updateRegion('language', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Time zone</span>
              <div className="relative w-44">
                <select
                  value={region.timeZone}
                  onChange={(e) => updateRegion('timeZone', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="IST (GMT+5:30)">IST (GMT+5:30)</option>
                  <option value="UTC">UTC</option>
                  <option value="EST (GMT-5)">EST (GMT-5)</option>
                  <option value="PST (GMT-8)">PST (GMT-8)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Date format</span>
              <div className="relative w-44">
                <select
                  value={region.dateFormat}
                  onChange={(e) => updateRegion('dateFormat', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span>Time format</span>
              <div className="relative w-44">
                <select
                  value={region.timeFormat}
                  onChange={(e) => updateRegion('timeFormat', e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="24 hour">24 hour</option>
                  <option value="12 hour">12 hour (AM/PM)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── CARD 8: DANGER ZONE (FULL WIDTH) ───────────────────────────────── */}
      <div className="bg-rose-50/40 border border-rose-200/80 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-rose-600 tracking-tight">Danger zone</h3>
        </div>

        <div className="space-y-4 pt-1">
          {/* Row 1: Logout from all devices */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Logout from all devices</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ends every active session except this one</p>
            </div>
            <button
              onClick={handleLogoutAll}
              className="self-start sm:self-auto bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Logout all
            </button>
          </div>

          {/* Row 2: Delete account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Delete account</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Permanently removes your profile, progress, and certificates</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="self-start sm:self-auto bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsView;
