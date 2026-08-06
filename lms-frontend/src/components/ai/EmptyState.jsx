import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
      <Sparkles size={48} className="text-slate-200 mb-3" />
      <h3 className="text-sm font-bold text-slate-500 mb-1">Ready to Generate</h3>
      <p className="text-xs text-slate-400 text-center max-w-sm">
        Fill in the configuration details on the left and hit generate to create customized assessment questions instantly.
      </p>
    </div>
  );
};

export default EmptyState;
