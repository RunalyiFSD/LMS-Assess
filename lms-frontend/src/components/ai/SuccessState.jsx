import React from 'react';
import { AlertCircle, FileCheck2, CheckSquare, Square, Save } from 'lucide-react';
import MCQCard from './MCQCard';
import CodingCard from './CodingCard';
import TheoryCard from './TheoryCard';
import Button from '../common/Button';

const SuccessState = ({ result, type, selectedIndices, onToggleSelection, onSelectAll, onSave, isSaving, saveResult }) => {
  if (!result || !result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center text-slate-500">
        No questions were generated. Please try again.
      </div>
    );
  }

  const allSelected = selectedIndices.length === result.questions.length;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      <div className="flex-1 p-6 overflow-y-auto pb-32">
        
        {saveResult && (
          <div className={`border rounded-lg p-4 mb-6 flex items-start gap-3 ${saveResult.failed === 0 && saveResult.duplicates === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <AlertCircle className={saveResult.failed === 0 && saveResult.duplicates === 0 ? 'text-emerald-500 mt-0.5' : 'text-amber-500 mt-0.5'} size={18} />
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${saveResult.failed === 0 && saveResult.duplicates === 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                Save Completed
              </h4>
              <p className={`text-xs mt-1 ${saveResult.failed === 0 && saveResult.duplicates === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {saveResult.saved} saved successfully. {saveResult.failed > 0 ? `${saveResult.failed} failed.` : ''} {saveResult.duplicates > 0 ? `${saveResult.duplicates} skipped (duplicate).` : ''}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href='/instructor/questions'}>View Question Bank</Button>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <FileCheck2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-800">Generation Successful</h4>
            <p className="text-xs text-emerald-600 mt-1">
              {result.questions.length} question(s) generated. Select the ones you want to save to the Question Bank.
            </p>
          </div>
          <button 
            onClick={onSelectAll}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            {allSelected ? <CheckSquare size={14}/> : <Square size={14}/>}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="space-y-4">
          {result.questions.map((question, idx) => {
            const isSelected = selectedIndices.includes(idx);
            
            const checkbox = (
              <div 
                className="absolute top-4 right-4 z-10 cursor-pointer p-1 bg-white rounded-md shadow-sm border border-slate-200 hover:border-brand-300"
                onClick={(e) => { e.stopPropagation(); onToggleSelection(idx); }}
              >
                {isSelected ? <CheckSquare className="text-brand-500" size={20} /> : <Square className="text-slate-300" size={20} />}
              </div>
            );

            // Wrappers to add relative positioning for the checkbox
            const wrapCard = (CardComponent) => (
              <div key={idx} className={`relative transition-all ${isSelected ? 'ring-2 ring-brand-500 rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                {checkbox}
                <CardComponent question={question} index={idx} />
              </div>
            );

            if (type === 'mcq') return wrapCard(MCQCard);
            if (type === 'coding') return wrapCard(CodingCard);
            if (type === 'theory') return wrapCard(TheoryCard);
            
            return null;
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex justify-between items-center z-20">
        <div className="text-sm text-slate-600 font-medium">
          {selectedIndices.length} of {result.questions.length} selected
        </div>
        <div className="flex gap-3">
          <Button 
            variant="primary" 
            disabled={selectedIndices.length === 0 || isSaving}
            onClick={() => onSave(false)}
            className="flex items-center gap-2"
          >
            {isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save size={16} />}
            Save Selected
          </Button>
          <Button 
            variant="outline" 
            disabled={isSaving}
            onClick={() => onSave(true)}
            className="flex items-center gap-2 border-brand-200 text-brand-700 hover:bg-brand-50"
          >
            <Save size={16} />
            Save All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessState;
