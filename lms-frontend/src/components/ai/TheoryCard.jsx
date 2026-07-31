import React from 'react';
import { AlignLeft } from 'lucide-react';

const TheoryCard = ({ question, index }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <h4 className="text-slate-800 font-medium leading-relaxed pt-1">
          {question.questionText}
        </h4>
      </div>
      
      <div className="pl-11">
        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <AlignLeft size={14} /> Grading Rubric
        </h5>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-orange-900 leading-relaxed whitespace-pre-wrap">
          {question.gradingRubric}
        </div>
      </div>
    </div>
  );
};

export default TheoryCard;
