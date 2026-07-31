import React from 'react';
import { Terminal } from 'lucide-react';

const CodingCard = ({ question, index }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <h4 className="text-slate-800 font-medium leading-relaxed pt-1">
          {question.problemStatement}
        </h4>
      </div>
      
      <div className="pl-11 space-y-4">
        <div>
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Terminal size={14} /> Starter Code
          </h5>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-blue-400 font-mono">
              {question.boilerplate}
            </pre>
          </div>
        </div>

        {Array.isArray(question.testCases) && question.testCases.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Test Cases
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.testCases.map((tc, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono">
                  <div className="mb-1"><span className="text-slate-400">Input:</span> <span className="text-slate-700">{tc.input}</span></div>
                  <div><span className="text-slate-400">Output:</span> <span className="text-emerald-600 font-bold">{tc.expectedOutput}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingCard;
