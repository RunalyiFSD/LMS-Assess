import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Key, Lock, Mail, ArrowLeft } from 'lucide-react';

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

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resetToken, setResetToken] = useState(token || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update token if url param changes
  useEffect(() => {
    if (token) {
      setResetToken(token);
    }
  }, [token]);

  // Redirect countdown on success
  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  }, [success, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 py-12 sm:px-16 md:px-24 bg-white relative">
        <div className="max-w-md w-full mx-auto">
          {/* Brand Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">A</span>
              <span className="font-bold text-slate-800 text-lg">AssessLMS</span>
            </Link>
          </div>

          {!success ? (
            <>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans mb-2">
                Set New Password
              </h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                Choose a strong password with at least 6 characters to secure your account.
              </p>

              {error && (
                <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                    />
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Reset Token / Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste reset token here"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                    />
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                    />
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                    />
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 mt-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Resetting Password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2">Password Reset Complete!</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>

              <div className="p-3 mb-6 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                Redirecting to login in <span className="font-bold text-slate-900 text-sm">{countdown}</span> seconds...
              </div>

              <Button onClick={() => navigate('/login')} className="w-full justify-center">
                Log In Now
              </Button>
            </div>
          )}

          {/* Return to Login */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel: Testimonial Carousel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#ebf0ff] flex-col justify-center items-center p-12 relative overflow-hidden">
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

export default ResetPassword;
