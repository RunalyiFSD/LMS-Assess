import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Bell,
  CheckCircle2,
  Award,
  FileText,
  Clock,
  CheckCheck,
  Filter,
  Check,
  AlertCircle,
  Sparkles,
  Search
} from 'lucide-react';

// Format timestamp
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Recently';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Icon selector based on title keywords
const getNotificationIcon = (title = '', type = '') => {
  const t = title.toLowerCase();
  if (t.includes('result') || t.includes('grade') || t.includes('passed')) {
    return <Award size={20} className="text-amber-500" />;
  }
  if (t.includes('published') || t.includes('assessment') || t.includes('quiz')) {
    return <CheckCircle2 size={20} className="text-indigo-600" />;
  }
  if (t.includes('schedule') || t.includes('date') || t.includes('reminder')) {
    return <Clock size={20} className="text-emerald-500" />;
  }
  return <Bell size={20} className="text-slate-500" />;
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Unread', 'Assessments'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      if (response.data?.status === 'success') {
        setNotifications(response.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load notifications page:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark single item as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all items as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered notifications list
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'Assessments') {
      const t = n.title.toLowerCase();
      return t.includes('assessment') || t.includes('result') || t.includes('quiz') || t.includes('test');
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Notifications Center</h1>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-2">
                  <span>Stay updated with assessment results, score releases, and course alerts.</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-bold">
                    Auto-deletes after 30 days
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="w-full sm:w-auto text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-2"
              >
                <CheckCheck size={16} className="text-indigo-600" />
                <span>Mark All as Read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Tab Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'All', label: 'All Notifications', count: notifications.length },
              { id: 'Unread', label: 'Unread', count: unreadCount },
              { id: 'Assessments', label: 'Assessments & Results', count: notifications.filter(n => n.title.toLowerCase().includes('result') || n.title.toLowerCase().includes('assessment')).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Notifications List Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Loading notifications...</span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-5 sm:p-6 transition-colors flex items-start justify-between gap-4 ${
                    !notif.isRead ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      !notif.isRead ? 'bg-white border border-indigo-100' : 'bg-slate-100'
                    }`}>
                      {getNotificationIcon(notif.title, notif.type)}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{notif.title}</h3>
                        {!notif.isRead ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                            New
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                            Read
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{notif.message}</p>
                      
                      <div className="pt-1 flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all shrink-0"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                You're all caught up! New notifications regarding assessments and results will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
