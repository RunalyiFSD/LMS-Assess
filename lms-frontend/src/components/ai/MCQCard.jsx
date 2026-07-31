import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const MCQCard = ({ question, index }) => {
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
      
      <div className="pl-11 space-y-2">
        {Array.isArray(question.options) && question.options.map((option, idx) => {
          const isCorrect = idx === question.correctAnswerIndex;
          return (
            <div 
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isCorrect 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-slate-50 border-slate-100 text-slate-700'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={18} className="text-slate-300 shrink-0" />
              )}
              <span className="text-sm">{option}</span>
            </div>
          );
        })}
      </div>

      {question.explanation && (
        <div className="ml-11 mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
};

export default MCQCard;
