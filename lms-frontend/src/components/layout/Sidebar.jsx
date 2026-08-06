import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  FileQuestion,
  GraduationCap,
  Trophy,
  History,
  User,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  Building2,
  Layers,
  ClipboardList,
  BarChart3,
  FileText,
  Headphones,
  ArrowRight
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  if (!user) return null;

  const getNavLinks = () => {
    if (user.role === 'admin') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { to: '/admin/users', label: 'Students & Instructors', icon: <Users size={18} /> },
        { to: '/admin/departments', label: 'Departments', icon: <Building2 size={18} /> },
        { to: '/admin/batches', label: 'Batches', icon: <Layers size={18} /> },
        { to: '/admin/assessments', label: 'Tests & Assessments', icon: <ClipboardList size={18} /> },
        { to: '/admin/analytics', label: 'Reports & Analytics', icon: <BarChart3 size={18} /> },
        { to: '/admin/logs', label: 'Activity Logs', icon: <FileText size={18} /> },
        { to: '/admin/support', label: 'Support', icon: <Headphones size={18} /> },
        { to: '/dashboard?tab=profile', label: 'Profile', icon: <User size={18} /> },
        { to: '/dashboard?tab=settings', label: 'Account & App Settings', icon: <Settings size={18} /> }
      ];
    }

    const common = [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/schedule', label: 'Assessment Calendar', icon: <Calendar size={18} /> },
      { to: '/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
      { to: '/dashboard?tab=profile', label: 'Profile', icon: <User size={18} /> },
      { to: '/dashboard?tab=settings', label: 'Settings', icon: <Settings size={18} /> }
    ];

    if (user.role === 'instructor') {
      return [
        ...common,
        { to: '/instructor/questions', label: 'Question Bank', icon: <FileQuestion size={18} /> },
        { to: '/instructor/mock-assignments', label: 'Mock Assessments', icon: <Building2 size={18} /> },
        { to: '/instructor/grade', label: 'Grade Submissions', icon: <GraduationCap size={18} /> }
      ];
    }

    if (user.role === 'student') {
      return [
        ...common,
        { to: '/dashboard?tab=progress', label: 'Progress Analytics', icon: <TrendingUp size={18} /> },
        { to: '/dashboard?tab=explore_mocks', label: 'Explore Mocks', icon: <BookOpen size={18} /> }
      ];
    }

    return common;
  };

  const links = getNavLinks();
  const isCollapsed = Boolean(user?.settings?.appearance?.sidebarCollapse);

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} text-[#F8FAFC] min-h-[calc(100vh-62px)] flex flex-col justify-between transition-all duration-300 print:hidden border-r ${
      isDark
        ? 'bg-[#0d111d] border-[#1e2436]'
        : 'bg-[#2D2354] border-[#3D317C]/40'
    }`}>
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-6`}>
        <div className="space-y-1">
          {links.map((link, idx) => {
            let isActive = false;
            if (link.to.includes('?')) {
              const [path, search] = link.to.split('?');
              isActive = location.pathname === path && location.search.includes(search);
            } else {
              isActive = location.pathname === link.to && !location.search.includes('tab=');
            }

            return (
              <Link
                key={idx}
                to={link.to}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-md font-bold'
                    : isDark
                      ? 'text-slate-400 hover:bg-[#182035] hover:text-white'
                      : 'text-slate-200 hover:bg-[#3D317C] hover:text-white'
                }`}
                style={
                  isActive
                    ? { backgroundImage: 'linear-gradient(90deg, #6366F1, #7C3AED)' }
                    : undefined
                }
              >
                {link.icon}
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={`${isCollapsed ? 'p-2 text-center' : 'p-4'} border-t ${
        isDark
          ? 'border-[#1e2436] bg-[#0a0e18]'
          : 'border-[#3D317C]/40 bg-slate-950/20'
      }`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          {!isCollapsed && (
            <span className={`text-xs font-semibold tracking-wide uppercase ${
              isDark ? 'text-emerald-400' : 'text-slate-300'
            }`}>
              {user.role} Session Active
            </span>
          )}
        </div>
        {!isCollapsed && isDark && (
          <div className="mt-2 space-y-1">
            <p className="text-[11px] text-slate-500">You're now in a secure session.</p>
            <button className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors">
              Learn more <ArrowRight size={11} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
