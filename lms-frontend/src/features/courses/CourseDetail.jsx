import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, Loader2, ArrowLeft, CheckCircle2, FileText, Video, Link as LinkIcon, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getCourseById(id);
      setCourse(res.data.data);

      // Check if enrolled
      if (user?.role === 'student') {
        const enrolls = await courseApi.getMyEnrollments();
        const activeEnrollment = enrolls.data.data.find(e => e.course_id === id && e.status === 'active');
        setIsEnrolled(!!activeEnrollment);

        // Fetch materials if enrolled or if it's the teacher
        if (activeEnrollment) {
           const matRes = await courseApi.getMaterials(id);
           setMaterials(matRes.data.data);
        }
      } else if (user?.id === res.data.data.teacher_id || user?.role === 'admin') {
         const matRes = await courseApi.getMaterials(id);
         setMaterials(matRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await courseApi.enroll(id);
      setIsEnrolled(true);
      // Fetch materials immediately after enrollment
      const matRes = await courseApi.getMaterials(id);
      setMaterials(matRes.data.data);
    } catch (err) {
      alert(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const getMaterialIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'link': return <LinkIcon className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Not Found</h2>
        <button onClick={() => navigate('/courses')} className="text-brand-600 hover:underline">Return to Courses</button>
      </div>
    );
  }

  const isTeacher = user?.id === course.teacher_id;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Course Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button onClick={() => navigate('/courses')} className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-slate-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Courses
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Thumbnail */}
            <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
               {course.thumbnail_url ? (
                 <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-brand-50">
                    <BookOpen className="w-16 h-16 text-brand-200" />
                 </div>
               )}
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-black uppercase tracking-wider rounded-full">
                  {course.departments?.name || 'General'}
                </span>
                {isTeacher && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider rounded-full">
                    {course.status}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed max-w-3xl">
                {course.description || 'No description provided for this course.'}
              </p>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    {course.users?.full_name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Instructor</p>
                    <p className="text-sm font-bold text-slate-900">{course.users?.full_name}</p>
                  </div>
                </div>

                {/* Enrollment Action */}
                {user?.role === 'student' && !isEnrolled && (
                  <button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm shadow-brand-500/30 transition-all transform hover:scale-[1.02]"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
                
                {user?.role === 'student' && isEnrolled && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={18} />
                    Enrolled
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Materials Section */}
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen className="text-brand-500" />
            Course Materials
          </h2>

          {!isEnrolled && !isTeacher && user?.role !== 'admin' ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Content Locked</h3>
              <p className="text-slate-500 text-sm font-medium">Please enroll in this course to access learning materials.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 border-dashed text-center">
                  <p className="text-slate-500 font-medium">No materials have been added to this course yet.</p>
                </div>
              ) : (
                materials.map((material) => (
                  <a 
                    key={material.id} 
                    href={material.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                        {getMaterialIcon(material.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{material.title}</h4>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{material.type}</p>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-brand-500 transition-colors">
                      <Download size={20} />
                    </div>
                  </a>
                ))
              )}
              
              {isTeacher && (
                <button className="w-full mt-4 py-4 border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50 rounded-2xl text-slate-500 hover:text-brand-600 font-bold transition-all text-sm flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Add New Material
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CourseDetail;
