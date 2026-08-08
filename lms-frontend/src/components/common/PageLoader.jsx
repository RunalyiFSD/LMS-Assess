import React from 'react';

const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Spinner Container */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-slate-900 animate-pulse" />
          <span className="relative text-white font-bold text-lg z-10">A</span>
          <div className="absolute -inset-1 rounded-2xl border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="font-semibold text-sm text-slate-800 tracking-wide">
            Loading Workspace...
          </span>
          <span className="text-xs text-slate-400">
            AssessLMS Evaluation Engine
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
