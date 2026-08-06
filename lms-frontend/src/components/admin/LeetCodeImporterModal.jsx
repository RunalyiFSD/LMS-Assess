import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import { X, Search, Check, Download, Code2, AlertCircle, Loader2 } from 'lucide-react';

const LeetCodeImporterModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [companySlug, setCompanySlug] = useState('google');
  const [questions, setQuestions] = useState([]);
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [isOpen, companySlug]);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/leetcode/preview/${companySlug}?limit=12`);
      if (res.data?.data?.questions) {
        setQuestions(res.data.data.questions);
      }
    } catch (err) {
      setError('Failed to fetch problem preview from LeetCode GraphQL.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (slug) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSlugs.length === questions.length) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(questions.map((q) => q.titleSlug));
    }
  };

  const handleImport = async () => {
    if (selectedSlugs.length === 0) {
      setError('Please select at least one problem to import.');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/leetcode/import', {
        companySlug,
        titleSlugs: selectedSlugs,
      });

      if (res.data?.status === 'success') {
        setSuccessMsg(`Successfully imported ${res.data.importedCount} questions into Question Bank!`);
        if (onImportSuccess) {
          onImportSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to import selected questions.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              <Code2 size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Import Questions from LeetCode</h2>
              <p className="text-xs text-slate-500">Query and sync company coding questions via LeetCode GraphQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Tag:</span>
            <select
              value={companySlug}
              onChange={(e) => setCompanySlug(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="google">Google</option>
              <option value="amazon">Amazon</option>
              <option value="microsoft">Microsoft</option>
              <option value="amdocs">Amdocs</option>
              <option value="meta">Meta (Facebook)</option>
              <option value="tcs">TCS</option>
              <option value="infosys">Infosys</option>
            </select>
          </div>

          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            {selectedSlugs.length === questions.length && questions.length > 0
              ? 'Deselect All'
              : 'Select All Questions'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 size={28} className="animate-spin text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Fetching LeetCode problem set...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions.map((q) => {
                const isSelected = selectedSlugs.includes(q.titleSlug);
                return (
                  <div
                    key={q.titleSlug}
                    onClick={() => toggleSelect(q.titleSlug)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/30 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900 truncate">{q.title}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {q.difficulty}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Acceptance: {q.acRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold">
            {selectedSlugs.length} problem(s) selected
          </span>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || selectedSlugs.length === 0}
              className="text-xs font-bold"
            >
              {importing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Importing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Download size={14} />
                  Import to Question Bank
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeImporterModal;
