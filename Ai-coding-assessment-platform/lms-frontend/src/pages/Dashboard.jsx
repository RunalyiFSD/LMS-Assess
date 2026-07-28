import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';
import InstructorDashboardView from '../components/dashboard/InstructorDashboardView';
import StudentDashboardView from '../components/dashboard/StudentDashboardView';
import SettingsView from '../components/dashboard/SettingsView';
import Button from '../components/common/Button';
import api from '../services/api';
import {
  Plus,
  Video,
  Camera,
  Trash,
  User as UserIcon,
  Pencil,
  Calendar,
  ChevronDown,
  Upload,
  Save,
  Share2,
  Lock,
  CheckCircle2,
  Circle
} from 'lucide-react';

// Custom Social Icon SVGs
const LinkedInIcon = ({ className = "w-4 h-4 text-[#0A66C2] shrink-0" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = ({ className = "w-4 h-4 text-slate-800 shrink-0" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4 text-[#1DA1F2] shrink-0" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4 text-[#E4405F] shrink-0" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const COUNTRY_PHONE_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada (+1)' },
  { code: '+44', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+61', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '+81', flag: '🇯🇵', name: 'Japan (+81)' },
  { code: '+49', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+86', flag: '🇨🇳', name: 'China (+86)' },
  { code: '+971', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil (+55)' },
  { code: '+7', flag: '🇷🇺', name: 'Russia (+7)' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa (+27)' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea (+82)' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan (+92)' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh (+880)' },
];

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [countryCode, setCountryCode] = useState('+91');
  const location = useLocation();

  // Sync active tab state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
    } else if (tab === 'settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);

  const [profileForm, setProfileForm] = useState({
    name: '',
    college: '',
    department: '',
    batch: '',
    bio: '',
    profilePicture: '',
    videoBioUrl: '',
    phoneNumber: '+91 98765 43210',
    dob: '22 / 05 / 2004',
    language: 'Java, Python',
    experience: '5 years',
    linkedin: 'https://linkedin.com/in/yourprofile',
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    instagram: 'https://instagram.com/yourusername',
    privacy: 'Visible to everyone',
  });

  const [updating, setUpdating] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync state when user profile is fetched / hydrated
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        college: user.college || 'SPPU',
        department: user.department || 'Computer Science',
        batch: user.batch || '2025',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        videoBioUrl: user.videoBioUrl || '',
        phoneNumber: user.phoneNumber || '+91 98765 43210',
        dob: user.dob || '22 / 05 / 2004',
        language: user.language || 'Java, Python',
        experience: user.experience || '5 years',
        linkedin: user.linkedin || 'https://linkedin.com/in/yourprofile',
        github: user.github || 'https://github.com/yourusername',
        twitter: user.twitter || 'https://twitter.com/yourusername',
        instagram: user.instagram || 'https://instagram.com/yourusername',
        privacy: user.privacy || 'Visible to everyone',
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoPreview, setVideoPreview] = useState('');
  const [mediaStream, setMediaStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const videoRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const dobInputRef = React.useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      setIsRecording(true);
      setRecordingTime(10); // 10 second limit

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      setRecorder(mediaRecorder);
      const localChunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          localChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(localChunks, { type: 'video/webm' });
        const localPreview = URL.createObjectURL(videoBlob);
        setVideoPreview(localPreview);
        
        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result;
          setUpdating(true);
          try {
            const formData = new FormData();
            formData.append('file', base64Data);
            formData.append('upload_preset', 'lms_videos');
            
            const res = await fetch('https://api.cloudinary.com/v1_1/dydt2w4o5/video/upload', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
              setProfileForm(prev => ({ ...prev, videoBioUrl: data.secure_url }));
            } else {
              throw new Error('Cloudinary response incomplete');
            }
          } catch (uploadErr) {
            console.warn('Cloudinary upload failed, using fallback video URL');
            setProfileForm(prev => ({ ...prev, videoBioUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4' }));
          } finally {
            setUpdating(false);
          }
        };
      };

      mediaRecorder.start();

      let timeLeft = 10;
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setRecordingTime(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerRef.current);
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 1000);

    } catch (err) {
      alert('Camera access denied or failed: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const removeVideo = () => {
    setVideoPreview('');
    setProfileForm(prev => ({ ...prev, videoBioUrl: '' }));
  };

  const handleBrowseVideo = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Video file size must be less than 10MB.');
        return;
      }
      
      const localPreview = URL.createObjectURL(file);
      setVideoPreview(localPreview);
      setUpdating(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'lms_videos');

        const res = await fetch('https://api.cloudinary.com/v1_1/dydt2w4o5/video/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          setProfileForm(prev => ({ ...prev, videoBioUrl: data.secure_url }));
        } else {
          throw new Error('Cloudinary response incomplete');
        }
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed, using fallback video URL');
        setProfileForm(prev => ({ ...prev, videoBioUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4' }));
      } finally {
        setUpdating(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data?.status === 'success') {
        setUser(res.data.data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  // Dynamic dashboard view dispatch based on user's authorized role
  const renderDashboardView = () => {
    if (user?.role === 'admin') {
      return <AdminDashboardView />;
    }
    if (user?.role === 'instructor') {
      return <InstructorDashboardView />;
    }
    return <StudentDashboardView />;
  };

  const renderProfileEditForm = () => {
    // Calculate completion percentage dynamically
    const hasPhoto = Boolean(profileForm.profilePicture || user?.profilePicture);
    const hasPersonalInfo = Boolean(profileForm.name && profileForm.college && profileForm.department);
    const hasBio = Boolean(profileForm.bio);
    const hasVideo = Boolean(profileForm.videoBioUrl || videoPreview);
    const hasSocial = Boolean(profileForm.linkedin || profileForm.github);

    const completedCount = [hasPhoto, hasPersonalInfo, hasBio, hasVideo, hasSocial].filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / 5) * 100);

    return (
      <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Alerts */}
        {profileSuccess && (
          <div className="lg:col-span-12 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}
        {profileError && (
          <div className="lg:col-span-12 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
            {profileError}
          </div>
        )}

        {/* ── LEFT COLUMN (MAIN FORM CARDS - 7 COLS) ────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Profile Overview */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Profile Overview</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Manage your personal details and how others see you.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-sm overflow-hidden border-2 border-white">
                  {profileForm.profilePicture ? (
                    <img src={profileForm.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'J'
                  )}
                </div>
                <label
                  htmlFor="avatar-file-input"
                  className="absolute -bottom-1 -right-1 bg-purple-600 hover:bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-xs transition-transform hover:scale-110"
                  title="Upload avatar"
                >
                  <Pencil size={11} />
                </label>
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 leading-tight">{profileForm.name || user?.name || 'User'}</h4>
                <p className="text-xs font-semibold text-slate-400">
                  {user?.role === 'instructor' ? 'Faculty Instructor' : user?.role === 'admin' ? 'Administrator' : 'Analytical Student'}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 border border-indigo-100/80 rounded-full text-indigo-700 text-[11px] font-bold mt-1">
                  <span>{profileForm.college || 'SPPU'}</span>
                  <span>•</span>
                  <span>{profileForm.department || (user?.role === 'instructor' ? 'Computer Science' : 'CS')}</span>
                  {user?.role === 'instructor' ? (
                    <>
                      <span>•</span>
                      <span>{profileForm.experience || '5 years'}</span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span>{profileForm.batch || '2025'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Personal Information</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Update your basic personal details.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'jay@gmail.com'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2: College, Department, Batch */}
              <div className={`grid grid-cols-1 ${user?.role === 'student' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">College / University</label>
                  <input
                    type="text"
                    value={profileForm.college}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, college: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                {user?.role === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Batch Year</label>
                    <div className="relative">
                      <select
                        value={profileForm.batch}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, batch: e.target.value }))}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Phone & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                    {/* Country Code Dropdown */}
                    <div className="relative flex items-center shrink-0 border-r border-slate-200 pr-1.5">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="appearance-none bg-transparent pl-1 pr-5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_PHONE_CODES.map((item, idx) => (
                          <option key={idx} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-1 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Phone Number Input */}
                    <input
                      type="text"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="98765 43210"
                      className="w-full text-xs text-slate-900 font-medium focus:outline-none bg-transparent px-1 py-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
                  <div
                    onClick={() => {
                      if (dobInputRef.current) {
                        if ('showPicker' in dobInputRef.current) {
                          dobInputRef.current.showPicker();
                        } else {
                          dobInputRef.current.focus();
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dobInputRef.current) {
                          if ('showPicker' in dobInputRef.current) {
                            dobInputRef.current.showPicker();
                          } else {
                            dobInputRef.current.focus();
                          }
                        }
                      }}
                      className="text-purple-600 hover:text-purple-700 shrink-0 cursor-pointer p-0.5 rounded transition-colors"
                      title="Open Calendar Picker"
                    >
                      <Calendar size={16} />
                    </button>
                    <input
                      ref={dobInputRef}
                      type="date"
                      value={
                        profileForm.dob && profileForm.dob.includes('/')
                          ? profileForm.dob.split('/').map(s => s.trim()).reverse().join('-')
                          : profileForm.dob || ''
                      }
                      onChange={(e) => {
                        const val = e.target.value; // YYYY-MM-DD
                        if (val) {
                          const [yyyy, mm, dd] = val.split('-');
                          const formatted = `${dd} / ${mm} / ${yyyy}`;
                          setProfileForm((prev) => ({ ...prev, dob: formatted }));
                        } else {
                          setProfileForm((prev) => ({ ...prev, dob: '' }));
                        }
                      }}
                      className="w-full text-xs text-slate-900 font-medium focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Short Biography */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Biography</label>
                <div className="relative">
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value.slice(0, 250) }))}
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] font-semibold text-slate-400">
                    {profileForm.bio?.length || 0} / 250
                  </span>
                </div>
              </div>

              {/* Professional Information (Optional) Section */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400">Professional Information (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">DEPARTMENT</label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. Computer Sc"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">LANGUAGE</label>
                    <input
                      type="text"
                      value={profileForm.language}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, language: e.target.value }))}
                      placeholder="e.g. Java, Python"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">YEARS OF EXPERIENCE</label>
                    <input
                      type="text"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g. 5 years"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Webcam Video Bio */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Video size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Webcam Video Bio</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Record a short video to introduce yourself.</p>
              </div>
            </div>

            <div className="border border-slate-200/80 bg-slate-50/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-44 relative overflow-hidden">
              {videoPreview ? (
                <video src={videoPreview} controls className="w-full h-44 object-cover rounded-xl" />
              ) : profileForm.videoBioUrl ? (
                <video src={profileForm.videoBioUrl} controls className="w-full h-44 object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-2 shadow-2xs">
                    <Video size={20} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No Video Recorded</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Record a 5-10 second video introducing yourself.</p>
                </div>
              )}

              {isRecording && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10">
                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-red-600/85 text-white font-extrabold text-xs px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5 shadow-sm">
                    ● Recording {recordingTime}s
                  </span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
                    <span>Record Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => document.getElementById('browse-video-input').click()}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload size={14} className="text-slate-500" />
                    <span>Upload Video</span>
                  </button>
                  <input
                    type="file"
                    id="browse-video-input"
                    accept="video/*"
                    onChange={handleBrowseVideo}
                    className="hidden"
                  />

                  {(videoPreview || profileForm.videoBioUrl) && (
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 ml-auto"
                    >
                      <Trash size={14} /> Remove
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  Stop Recording
                </button>
              )}
            </div>
          </div>

          {/* Bottom Save Action Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            <span>{updating ? 'Saving Profile Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>

        {/* ── RIGHT COLUMN (SIDEBAR CARDS - 5 COLS) ─────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Profile Completion */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Profile Completion</h3>

            {/* Circular Gauge & Stat info */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-purple-600 transition-all duration-700"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-900">{completionPercentage}%</span>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900">Great! Almost there</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed">
                  Complete your profile to get better recommendations.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                {hasPhoto ? (
                  <CheckCircle2 size={16} className="text-purple-600 shrink-0 fill-purple-600 text-white" />
                ) : (
                  <Circle size={16} className="text-slate-300 shrink-0" />
                )}
                <span className={hasPhoto ? 'text-slate-800 font-bold' : 'text-slate-400'}>Add Profile Photo</span>
              </div>

              <div className="flex items-center gap-2.5">
                {hasPersonalInfo ? (
                  <CheckCircle2 size={16} className="text-purple-600 shrink-0 fill-purple-600 text-white" />
                ) : (
                  <Circle size={16} className="text-slate-300 shrink-0" />
                )}
                <span className={hasPersonalInfo ? 'text-slate-800 font-bold' : 'text-slate-400'}>Personal Information</span>
              </div>

              <div className="flex items-center gap-2.5">
                {hasBio ? (
                  <CheckCircle2 size={16} className="text-purple-600 shrink-0 fill-purple-600 text-white" />
                ) : (
                  <Circle size={16} className="text-slate-300 shrink-0" />
                )}
                <span className={hasBio ? 'text-slate-800 font-bold' : 'text-slate-400'}>Short Biography</span>
              </div>

              <div className="flex items-center gap-2.5">
                {hasVideo ? (
                  <CheckCircle2 size={16} className="text-purple-600 shrink-0 fill-purple-600 text-white" />
                ) : (
                  <Circle size={16} className="text-slate-300 shrink-0" />
                )}
                <span className={hasVideo ? 'text-slate-800 font-bold' : 'text-slate-400'}>Webcam Video Bio</span>
              </div>

              <div className="flex items-center gap-2.5">
                {hasSocial ? (
                  <CheckCircle2 size={16} className="text-purple-600 shrink-0 fill-purple-600 text-white" />
                ) : (
                  <Circle size={16} className="text-slate-300 shrink-0" />
                )}
                <span className={hasSocial ? 'text-slate-800 font-bold' : 'text-slate-400'}>Social Links (Optional)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Social Links (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Social Links (Optional)</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Add your social profiles to connect.</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* LinkedIn */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                <LinkedInIcon />
                <input
                  type="text"
                  value={profileForm.linkedin}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              {/* GitHub */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                <GithubIcon />
                <input
                  type="text"
                  value={profileForm.github}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, github: e.target.value }))}
                  placeholder="https://github.com/yourusername"
                  className="w-full text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              {/* Twitter */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                <TwitterIcon />
                <input
                  type="text"
                  value={profileForm.twitter}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://twitter.com/yourusername"
                  className="w-full text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                <InstagramIcon />
                <input
                  type="text"
                  value={profileForm.instagram}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/yourusername"
                  className="w-full text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Privacy */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Privacy</h3>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700">Profile Visibility</label>
              <div className="relative">
                <select
                  value={profileForm.privacy}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, privacy: e.target.value }))}
                  className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  <option value="Visible to everyone">Visible to everyone</option>
                  <option value="Instructors only">Instructors only</option>
                  <option value="Only me">Only me</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium pt-1">You can change who can see your profile.</p>
            </div>
          </div>

        </div>
      </form>
    );
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize flex items-center gap-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">
            Your analytical {user?.role || 'Student'} workspace hub is ready.
          </p>
        </div>
      </div>

      {/* Elegant glassmorphic tabs row */}
      <div className="flex gap-4 border-b border-slate-200 mb-6 print:hidden">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'dashboard'
              ? 'text-brand-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Dashboard Workspace
          {activeTab === 'dashboard' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'profile'
              ? 'text-brand-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Edit Profile Settings
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'settings'
              ? 'text-brand-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Account & App Settings
          {activeTab === 'settings' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'dashboard' ? (
          renderDashboardView()
        ) : activeTab === 'profile' ? (
          renderProfileEditForm()
        ) : (
          <SettingsView />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
