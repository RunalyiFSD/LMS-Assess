import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    badge: 'SUCCESS STORIES',
    heading: 'See how others have thrived',
    label: 'Achievement',
    company: 'amdocs',
    quote: '"My experience with AssessLMS has been truly rewarding! It provided a platform to test and enhance my problem-solving skills, engage with real-world coding challenges, and gain valuable exposure to industry-level problem setting. The competitive environment pushed me to think critically and improve my coding efficiency."',
    author: 'Chinthalapudi Sri Rama Gokula',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120'
  },
  {
    id: 2,
    badge: 'PLACEMENTS 2026',
    heading: 'Land your dream tech role',
    label: 'Placement Success',
    company: 'google',
    quote: '"The assessment lobby and the live coding editor were pivotal in my interview prep. The platform simulates high-pressure environments perfectly. Thanks to the custom mock challenges, I was able to secure a software engineering role with Google!"',
    author: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
  },
  {
    id: 3,
    badge: 'LEADERBOARD RUNNERS',
    heading: 'Compete and get recognized',
    label: 'Rank Achievement',
    company: 'microsoft',
    quote: '"AssessLMS turned learning into a sport. Competing on weekly leaderboards with peers pushed me to refactor my code for optimal speed and memory. The feedback loop is instantaneous and incredibly addictive!"',
    author: 'Neha Patil',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120'
  }
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    department: '',
    batch: '',
    bio: '',
    language: '',
    experience: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);

  // Testimonials automatic rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Panel: Registration Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 py-12 sm:px-16 md:px-24 bg-white relative overflow-y-auto">
        <div className="max-w-lg w-full mx-auto py-8">
          
          {/* Brand Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">A</span>
              <span className="font-bold text-slate-800 text-lg">AssessLMS</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h2>
            <p className="text-xs text-slate-500 mt-1">Get started with a free account and start practicing</p>
          </div>

          {/* Register Form Card */}
          <Card className="p-6 shadow-sm border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-accent-danger rounded-lg flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@college.edu"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Optional role-based info */}
              {formData.role !== 'admin' && (
                <div className="border-t border-slate-100 pt-4 mt-2">
                  {formData.role === 'instructor' ? (
                    <>
                      <p className="text-xs text-slate-400 font-medium mb-3">Professional Information (Optional)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 min-h-[28px] flex items-end">Department</label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. Computer Science"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 min-h-[28px] flex items-end">Language</label>
                          <input
                            type="text"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            placeholder="e.g. Java, Python"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 min-h-[28px] flex items-end">Experience (Yrs)</label>
                          <input
                            type="text"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="e.g. 5 years"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400 font-medium mb-3">Academic Information (Optional)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 min-h-[28px] flex items-end">College/Univ</label>
                          <input
                            type="text"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            placeholder="e.g. MIT"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 min-h-[28px] flex items-end">Department</label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. CSE"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 min-h-[28px] flex items-end">Batch Year</label>
                          <input
                            type="text"
                            name="batch"
                            value={formData.batch}
                            onChange={handleChange}
                            placeholder="e.g. 2026"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Panel: Success Stories Carousel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#ebf0ff] flex-col justify-center items-center p-12 relative overflow-hidden">
        
        {/* Testimonial Box */}
        <div className="bg-[#c3cfff] rounded-3xl p-10 max-w-md w-full relative shadow-lg min-h-[380px] flex flex-col justify-between transition-all duration-500 ease-in-out">
          <div>
            <span className="text-xs font-extrabold text-[#536dfe] tracking-widest uppercase block mb-1">
              {testimonials[activeSlide].badge}
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
              {testimonials[activeSlide].heading}
            </h3>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {testimonials[activeSlide].label}
              </span>
              <span className="text-xl font-black text-slate-800 tracking-wider">
                {testimonials[activeSlide].company}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
              {testimonials[activeSlide].quote}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-indigo-200">
            <img
              src={testimonials[activeSlide].avatar}
              alt={testimonials[activeSlide].author}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <span className="font-bold text-slate-800 text-sm">
              {testimonials[activeSlide].author}
            </span>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="flex gap-2.5 mt-6">
          {testimonials.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeSlide ? 'bg-slate-900 scale-110' : 'bg-slate-400 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Register;
