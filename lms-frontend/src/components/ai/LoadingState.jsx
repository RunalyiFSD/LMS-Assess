import React from 'react';

const LoadingState = ({ count, difficulty, type, topic }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
      <div className="relative mb-4">
        <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
      </div>
      <h3 className="text-sm font-bold text-slate-600 mb-1">AI is thinking...</h3>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        Crafting {count} {difficulty} {type.toUpperCase()} question(s) on "{topic || 'your topic'}".
      </p>
    </div>
  );
};

export default LoadingState;
