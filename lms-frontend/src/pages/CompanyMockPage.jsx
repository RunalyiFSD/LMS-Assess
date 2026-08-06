import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Building2,
  Code2,
  Brain,
  Play,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const CompanyMockPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState({});
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('google');
  const [liveQuestions, setLiveQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generatingMock, setGeneratingMock] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'preview'

  // Fetch company metadata presets
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/leetcode/companies');
        if (res.data?.data?.companies) {
          setCompanies(res.data.data.companies);
        }
      } catch (err) {
        console.error('Failed to fetch company metadata:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch live LeetCode questions for selected company
  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyPreview(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchCompanyPreview = async (slug) => {
    setLoadingQuestions(true);
    setError(null);
    try {
      const res = await api.get(`/leetcode/preview/${slug}?limit=8`);
      if (res.data?.data?.questions) {
        setLiveQuestions(res.data.data.questions);
      }
    } catch (err) {
      console.error('Failed to preview questions from LeetCode:', err);
      setError('Could not fetch live LeetCode questions. Using high-yield company question bank.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartMockTest = async (slug) => {
    setGeneratingMock(true);
    setError(null);
    try {
      const res = await api.post('/leetcode/create-mock', {
        companySlug: slug,
      });

      if (res.data?.data?.assessment?._id) {
        const assessmentId = res.data.data.assessment._id;
        // Directly navigate student to test lobby
        navigate(`/lobby/${assessmentId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize Company Mock Assessment. Please try again.');
    } finally {
      setGeneratingMock(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'moderate':
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'difficult':
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-brand-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>LeetCode GraphQL Engine Integrated</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Company Aptitude & Coding Mock Tests
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Practice real interview questions tagged by top tech companies (Google, Amazon, Microsoft, Amdocs, Meta, TCS). Powered by real-time LeetCode problem querying combined with specialized Quantitative and Logical Aptitude MCQs.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-brand-400" />
                <span>Live LeetCode DSA Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-emerald-400" />
                <span>Aptitude & Reasoning MCQs</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-amber-400" />
                <span>Instant Performance Scorecards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs text-red-500 hover:text-red-800 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation & Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Select Company Grid
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Live LeetCode Question Explorer
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
            <span>Select any company to generate a instant 60-minute placement exam</span>
          </div>
        </div>

        {/* Main Grid View */}
        {activeTab === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingCompanies
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
                ))
              : Object.entries(companies).map(([slug, details]) => (
                  <Card
                    key={slug}
                    className={`p-6 border transition-all duration-300 hover:shadow-lg flex flex-col justify-between relative overflow-hidden group ${
                      selectedCompany === slug
                        ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                          <img
                            src={details.logo}
                            alt={details.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {details.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-1">{details.name}</h3>
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {details.description}
                      </p>

                      {/* Topic Tags */}
                      <div className="mb-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Key Evaluation Topics
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {details.topics?.map((topic, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <Button
                        onClick={() => {
                          setSelectedCompany(slug);
                          handleStartMockTest(slug);
                        }}
                        disabled={generatingMock && selectedCompany === slug}
                        className="w-full justify-center text-xs font-bold py-2.5"
                      >
                        {generatingMock && selectedCompany === slug ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Building Mock Exam...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Play size={14} />
                            Start {details.name} Mock Test
                          </span>
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompany(slug);
                          setActiveTab('preview');
                        }}
                        className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors cursor-pointer"
                      >
                        Explore LeetCode Questions ({slug})
                      </button>
                    </div>
                  </Card>
                ))}
          </div>
        )}

        {/* Live Explorer View */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Company Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Company:</span>
              {Object.entries(companies).map(([slug, details]) => (
                <button
                  key={slug}
                  onClick={() => setSelectedCompany(slug)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedCompany === slug
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {details.name}
                </button>
              ))}
            </div>

            {/* Questions Table */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 capitalize">
                    {selectedCompany} LeetCode Problem Set
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fetched live via LeetCode GraphQL API endpoint (`https://leetcode.com/graphql`)
                  </p>
                </div>

                <Button
                  onClick={() => handleStartMockTest(selectedCompany)}
                  disabled={generatingMock}
                  className="text-xs font-bold"
                >
                  {generatingMock ? (
                    <Loader2 size={14} className="animate-spin mr-2" />
                  ) : (
                    <Play size={14} className="mr-2" />
                  )}
                  Launch Mock with these Questions
                </Button>
              </div>

              {loadingQuestions ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 size={32} className="animate-spin text-brand-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Querying LeetCode GraphQL API...</p>
                </div>
              ) : liveQuestions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">Problem Title</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Acceptance Rate</th>
                        <th className="py-3 px-4">Topics</th>
                        <th className="py-3 px-4 text-right">LeetCode Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {liveQuestions.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <Code2 size={16} className="text-slate-400 shrink-0" />
                            <span>{q.title}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize border ${getDifficultyBadge(
                                q.difficulty
                              )}`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold">{q.acRate}%</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {q.tags?.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={`https://leetcode.com/problems/${q.titleSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              <span>View on LeetCode</span>
                              <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No live questions returned for this company tag.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyMockPage;
