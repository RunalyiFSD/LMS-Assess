import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
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

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Retrieve OAuth error if present in URL query parameters
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [searchParams]);

  // Testimonials automatic rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    // Redirect direct to backend OAuth routes
    const baseUrl = import.meta.env.VITE_API_URL.replace('/v1', '');
    window.location.href = `${baseUrl}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Panel: Auth Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 py-12 sm:px-16 md:px-24 bg-white relative">
        <div className="max-w-md w-full mx-auto">
          
          {/* Brand Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">A</span>
              <span className="font-bold text-slate-800 text-lg">AssessLMS</span>
            </Link>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans mb-6">
            Log In to AssessLMS
          </h2>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48C21.68,11.78 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,1 -3.37,1 -2.6,0 -4.8,-1.75 -5.58,-4.12H2.3v2.66C3.78,17.22 7.6,20.6 12,20.6z" fill="#34A853" />
                <path d="M6.42,12.7c-0.2,-0.6 -0.3,-1.24 -0.3,-1.9s0.1,-1.3 0.3,-1.9V6.24H2.3C1.5,7.84 1,9.67 1,11.6c0,1.93 0.5,3.76 1.3,5.36l3.12,-2.26H6.42z" fill="#FBBC05" />
                <path d="M12,6.28c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.48 14.43,2.6 12,2.6c-4.4,0 -8.22,3.38 -9.7,7.74l3.12,2.26C6.2,10.23 8.4,6.28 12,6.28z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md bg-black hover:bg-zinc-950 transition-colors text-sm font-semibold text-white shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-slate-400">OR</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-xs font-semibold">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Enter Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="**********"
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing In...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Links Footer */}
          <div className="flex items-center justify-between mt-6 text-xs font-medium">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
            <div className="text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
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

export default Login;
