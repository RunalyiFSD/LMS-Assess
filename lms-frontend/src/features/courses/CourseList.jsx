import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, Clock, Loader2, Plus } from 'lucide-react';
import CreateCourseModal from './CreateCourseModal';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Teachers see their courses; Students see published courses usually (handled by backend/RLS)
      const res = await courseApi.getAllCourses();
      setCourses(res.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Explore Courses</h1>
          <p className="text-slate-500 font-medium">Discover new topics and enhance your skills.</p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-brand-500/30 transition-all transform hover:scale-[1.02]"
          >
            <Plus size={18} />
            Create Course
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-semibold mb-8 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
          <p className="font-semibold text-sm tracking-wide">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Courses Found</h3>
          <p className="text-slate-500 text-sm">Check back later for new content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link 
              key={course.id} 
              to={`/courses/${course.id}`}
              className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 group-hover:scale-105 transition-transform duration-500">
                    <BookOpen className="w-12 h-12 text-brand-300" />
                  </div>
                )}
                {/* Status Badge for Teachers */}
                {user?.id === course.teacher_id && (
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full backdrop-blur-md shadow-sm ${course.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                      {course.status}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
                  {course.departments?.name || 'General'}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 font-medium">
                  {course.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>{course.users?.full_name || 'Instructor'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateCourseModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCourseCreated}
        />
      )}
    </div>
  );
};

export default CourseList;
