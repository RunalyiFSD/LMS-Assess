import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import api from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Download,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const ReportsAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mocked/Aggregated Analytics Data
  const monthlyData = [
    { month: 'Jan', attempts: 45, avgScore: 76 },
    { month: 'Feb', attempts: 62, avgScore: 81 },
    { month: 'Mar', attempts: 88, avgScore: 84 },
    { month: 'Apr', attempts: 110, avgScore: 88 },
    { month: 'May', attempts: 145, avgScore: 86 },
    { month: 'Jun', attempts: 190, avgScore: 91 },
  ];

  const departmentPerformance = [
    { name: 'Computer Science', passRate: 92, avgScore: 86 },
    { name: 'Information Tech', passRate: 88, avgScore: 82 },
    { name: 'Simulation Eng', passRate: 94, avgScore: 89 },
    { name: 'Electronics', passRate: 82, avgScore: 78 },
    { name: 'Mechanical', passRate: 78, avgScore: 74 },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleExportAnalyticsCSV = () => {
    const headers = ['Department', 'Pass Rate (%)', 'Average Score (%)'];
    const csvRows = [headers.join(',')];

    departmentPerformance.forEach((d) => {
      csvRows.push(`"${d.name}",${d.passRate},${d.avgScore}`);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `institution_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-[#121038] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-950">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors mb-1"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <BarChart3 className="text-indigo-400" size={30} />
                Reports & Institution Analytics
              </h1>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Comprehensive platform performance visualizers, score distribution histograms, departmental pass rates, and report exports.
              </p>
            </div>

            <div>
              <button
                onClick={handleExportAnalyticsCSV}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Download size={16} /> Export CSV Report
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Platform Pass Rate</span>
              <p className="text-2xl font-black text-slate-800">88.4%</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Award size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Average Test Score</span>
              <p className="text-2xl font-black text-slate-800">84.2 / 100</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Monthly Attempt Volume</span>
              <p className="text-2xl font-black text-slate-800">650+ Attempts</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Test-Takers</span>
              <p className="text-2xl font-black text-slate-800">120 Active</p>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Attempt Progress Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              Monthly Test Attempt Volume & Score Growth
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="attempts" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAttempts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Pass Rate Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-600" />
              Departmental Pass Rate Benchmarks (%)
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Bar dataKey="passRate" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsAnalyticsPage;
