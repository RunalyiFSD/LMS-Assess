import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Sparkles } from 'lucide-react';

const QuestionConfigurationCard = ({ form, errors, subjects, isGenerating, handleChange, handleGenerate, handleReset }) => {
  return (
    <Card title="Configuration" bodyClassName="p-4">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-brand-500 ${errors.subject ? 'border-red-400' : 'border-slate-200'}`}
            disabled={isGenerating}
            required
          >
            {(!subjects || subjects.length === 0) && (
              <option value="" disabled>No subjects available</option>
            )}
            {subjects && subjects.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          {errors.subject && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="e.g. React Hooks, Binary Trees"
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white ${
              errors.topic ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
            }`}
            disabled={isGenerating}
          />
          {errors.topic && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.topic}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-brand-500"
            disabled={isGenerating}
          >
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="coding">Coding Challenge</option>
            <option value="theory">Theoretical Essay</option>
          </select>
        </div>

        {form.type === 'coding' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Programming Language</label>
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-brand-500"
              disabled={isGenerating}
            >
              <option value="javascript">JavaScript / Node.js</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-brand-500"
              disabled={isGenerating}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Count (1-10)</label>
            <input
              type="number"
              name="count"
              min="1"
              max="10"
              value={form.count}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white ${
                errors.count ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
              }`}
              disabled={isGenerating}
            />
            {errors.count && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.count}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Marks Per Question</label>
          <input
            type="number"
            name="marksPerQuestion"
            min="1"
            value={form.marksPerQuestion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-brand-500"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Additional Instructions</label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            placeholder="e.g. Focus on edge cases, keep it brief..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white h-20 resize-none focus:ring-brand-500"
            disabled={isGenerating}
          ></textarea>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isGenerating} className="w-1/3">
            Reset
          </Button>
          <Button type="submit" variant="primary" disabled={isGenerating} className="w-2/3 flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuestionConfigurationCard;
