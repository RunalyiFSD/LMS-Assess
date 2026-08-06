import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { AlertCircle, CheckCircle, ArrowLeft, Mail, Key, Copy, Check } from 'lucide-react';

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

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate testimonials
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
      const res = await forgotPassword(email);
      if (res?.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to process request. Please check email.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

          {!submitted ? (
            <>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans mb-2">
                Forgot Password?
              </h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                No worries! Enter your registered email address below and we'll send you instructions to reset your password.
              </p>

              {error && (
                <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                    />
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      Sending Reset Link...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm animate-bounce">
                <CheckCircle size={32} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2">Check Your Inbox</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                We've sent password reset instructions to <span className="font-bold text-slate-900">{email}</span>.
              </p>

              {resetToken && (
                <Card className="p-4 mb-6 bg-slate-50 border border-slate-200 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Key size={14} /> Verification Token
                    </span>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-slate-800 break-all select-all font-semibold">
                    {resetToken}
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/reset-password/${resetToken || ''}?email=${encodeURIComponent(email)}`)}
                  className="w-full justify-center"
                >
                  Proceed to Reset Password
                </Button>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold block mx-auto underline cursor-pointer"
                >
                  Didn't receive email? Try another address
                </button>
              </div>
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

export default ForgotPassword;
