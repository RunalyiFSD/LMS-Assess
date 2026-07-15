import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  FileQuestion,
  GraduationCap,
  Trophy,
  History,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  // Define navigation items based on User roles
  const getNavLinks = () => {
    const common = [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/dashboard?tab=profile', label: 'Profile Settings', icon: <User size={18} /> }
    ];

    if (user.role === 'admin') {
      return [
        ...common,
        { to: '/admin/users', label: 'Students & Instructors', icon: <Users size={18} /> },
        { to: '/admin/subjects', label: 'Subjects', icon: <BookOpen size={18} /> }
      ];
    }

    if (user.role === 'instructor') {
      return [
        ...common,
        { to: '/instructor/questions', label: 'Question Bank', icon: <FileQuestion size={18} /> },
        { to: '/instructor/grade', label: 'Grade Submissions', icon: <GraduationCap size={18} /> }
      ];
    }

    if (user.role === 'student') {
      return [
        ...common,
        { to: '/student/history', label: 'Attempt History', icon: <History size={18} /> }
      ];
    }

    return common;
  };

  const links = getNavLinks();

  return (
    <aside className="w-64 bg-[#2D2354] text-[#F8FAFC] min-h-[calc(100vh-62px)] flex flex-col justify-between border-r border-[#3D317C]/40">
      <div className="px-4 py-6">
        <div className="space-y-1">
          {links.map((link, idx) => {
            // Calculate active state including query parameters to resolve dashboard overlay duplicates
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-[#F8FAFC] hover:bg-[#3D317C] hover:text-[#F8FAFC]'
                }`}
                style={
                  isActive
                    ? { backgroundImage: 'linear-gradient(90deg, #6366F1, #7C3AED)' }
                    : undefined
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Footer Role display card */}
      <div className="p-4 border-t border-[#3D317C]/40 bg-slate-950/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-300 font-medium tracking-wide uppercase">
            {user.role} Session Active
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
