import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';
import InstructorDashboardView from '../components/dashboard/InstructorDashboardView';
import StudentDashboardView from '../components/dashboard/StudentDashboardView';
import Button from '../components/common/Button';
import api from '../services/api';
import { Plus, Video, Camera, Trash } from 'lucide-react';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  // Sync active tab state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
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
  });

  const [updating, setUpdating] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync state when user profile is fetched / hydrated
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        college: user.college || '',
        department: user.department || '',
        batch: user.batch || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        videoBioUrl: user.videoBioUrl || '',
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
    return (
      <div className="max-w-2xl bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center font-black font-mono text-xl overflow-hidden shadow-sm">
              {profileForm.profilePicture ? (
                <img src={profileForm.profilePicture} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
              )}
            </div>
            <label
              htmlFor="avatar-file-input"
              className="absolute -bottom-1 -right-1 bg-brand-500 hover:bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-sm transition-transform hover:scale-110 active:scale-95"
              title="Upload profile picture"
            >
              <Plus size={12} />
            </label>
            <input
              type="file"
              id="avatar-file-input"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Edit Account Profile Details</h3>
            <p className="text-xs text-slate-500">Update your avatar, institution details, and bio info.</p>
            {profileForm.profilePicture && (
              <button
                type="button"
                onClick={() => setProfileForm((prev) => ({ ...prev, profilePicture: '' }))}
                className="mt-1.5 text-[11px] font-bold text-red-500 hover:text-red-750 transition-colors flex items-center gap-1"
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
              Profile updated successfully!
            </div>
          )}
          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 text-accent-danger rounded-lg text-xs font-semibold">
              {profileError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* URL input field removed, replaced by click-to-upload button overlay */}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">College/Univ</label>
              <input
                type="text"
                value={profileForm.college}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, college: e.target.value }))}
                placeholder="e.g. MIT"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            {user?.role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Batch Year</label>
                <input
                  type="text"
                  value={profileForm.batch}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, batch: e.target.value }))}
                  placeholder="e.g. 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Short Biography Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="w-full h-24 p-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-brand-500"
            />
          </div>

          {/* Webcam Video Bio Section - Student Only */}
          {user?.role === 'student' && (
            <div className="border-t border-slate-100 pt-4 mt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Webcam Video Bio</label>
              
              <div className="relative border border-slate-200 bg-slate-50 rounded-xl overflow-hidden min-h-60 flex flex-col items-center justify-center">
                {videoPreview ? (
                  <video src={videoPreview} controls className="w-full h-60 object-cover" />
                ) : profileForm.videoBioUrl ? (
                  <video src={profileForm.videoBioUrl} controls className="w-full h-60 object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Video size={36} className="text-slate-350 mb-2" />
                    <p className="text-xs font-semibold text-slate-500">No Video Bio Recorded</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Record a 5-10 second video introducing yourself.</p>
                  </div>
                )}

                {/* Webcam Live Feed overlays during recording */}
                {isRecording && (
                  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-red-600/85 text-white font-extrabold font-mono text-xs px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5 shadow-sm">
                      ● Recording {recordingTime}s
                    </span>
                  </div>
                )}
              </div>

              {/* Record Action Buttons */}
              <div className="flex items-center gap-3 mt-3">
                {!isRecording ? (
                  <>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-650 inline-flex items-center gap-1.5 transition-micro"
                    >
                      <Camera size={14} /> Record Video Bio
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('browse-video-input').click()}
                      className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-650 inline-flex items-center gap-1.5 transition-micro"
                    >
                      <Video size={14} /> Browse Local Video
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
                        className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-605 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-micro"
                      >
                        <Trash size={14} /> Remove Video
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-micro shadow-sm"
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </div>
          )}

          <Button type="submit" disabled={updating} className="w-full py-2.5">
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving Updates...
              </span>
            ) : (
              'Save Profile Changes'
            )}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">
            Your analytical {user?.role || 'Student'} workspace hub is ready.
          </p>
        </div>
      </div>

      {/* Elegant glassmorphic tabs row */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
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
      </div>

      <div className="mt-4">
        {activeTab === 'dashboard' ? renderDashboardView() : renderProfileEditForm()}
      </div>
    </Layout>
  );
};

export default Dashboard;
