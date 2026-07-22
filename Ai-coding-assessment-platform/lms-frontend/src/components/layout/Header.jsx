import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, User as UserIcon, X } from 'lucide-react';
import api from '../../services/api';
import Button from '../common/Button';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmLogout = async () => {
    setShowConfirmModal(false);
    navigate('/', { replace: true });
    setTimeout(async () => {
      await logout();
    }, 100);
  };

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        if (response.data?.status === 'success') {
          const list = response.data.data || [];
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.warn('Failed to fetch notifications');
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#2D2354] border-b border-[#3D317C]/40 px-6 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-[#3D317C] border border-[#4E3F9B] flex items-center justify-center text-white font-bold text-base shadow-sm">
          A
        </span>
        <span className="font-bold text-white text-lg tracking-tight">AssessLMS</span>
      </div>

      {/* User Actions & Alerts */}
      <div className="flex items-center gap-4">
        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-lg hover:bg-[#3D317C] text-slate-400 hover:text-slate-200 relative transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-xs">Notifications</span>
                  {unreadCount > 0 && <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>}
                </div>
                <button
                  onClick={() => setShowNotif(false)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-650 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet.</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkAsRead(notif._id)}
                      className={`px-4 py-3 text-xs border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-brand-50/20 font-medium' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-slate-800 font-semibold">{notif.title}</p>
                        {!notif.isRead && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1"></span>}
                      </div>
                      <p className="text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

         {/* User Info & Profile Menu */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#3D317C]/40">
              <Link to="/dashboard?tab=profile" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#3D317C] text-slate-200 border border-[#4E3F9B] flex items-center justify-center font-black font-mono text-[10px] tracking-tight">
                    {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
             
             <button
               onClick={() => setShowConfirmModal(true)}
               title="Log Out"
               className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition-colors ml-1"
             >
               <LogOut size={18} />
             </button>
           </div>
         ) : (
           <div className="flex items-center gap-3 pl-2 border-l border-[#3D317C]/40">
             <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
               Sign In
             </Link>
           </div>
         )}
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} />
            </div>
            
            <h3 className="text-lg font-black text-slate-800">Are you sure?</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              You will be logged out.
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-650 hover:bg-red-700 border-none text-white font-bold"
                onClick={handleConfirmLogout}
              >
                Yes, Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
