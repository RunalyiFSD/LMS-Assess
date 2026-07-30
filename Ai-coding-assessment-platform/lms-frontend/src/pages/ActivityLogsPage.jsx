import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import {
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Info,
  AlertTriangle,
  ArrowLeft,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActivityLogsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Sample Audit Logs Data
  const sampleLogs = [
    {
      id: '1',
      timestamp: '2026-07-30 12:44:12',
      user: 'admin@college.edu',
      role: 'admin',
      action: 'UPDATE_USER_ROLE',
      details: 'Updated user role for john@instructor.com to instructor',
      severity: 'Info',
      ip: '192.168.1.102',
    },
    {
      id: '2',
      timestamp: '2026-07-30 12:40:05',
      user: 'instructor@college.edu',
      role: 'instructor',
      action: 'CREATE_ASSESSMENT',
      details: 'Created assessment "Algorithm Coding Sandbox Test"',
      severity: 'Info',
      ip: '192.168.1.115',
    },
    {
      id: '3',
      timestamp: '2026-07-30 12:30:18',
      user: 'student1@college.edu',
      role: 'student',
      action: 'SUBMIT_ASSESSMENT',
      details: 'Completed DSA Midterm Quiz with score 100%',
      severity: 'Info',
      ip: '192.168.1.140',
    },
    {
      id: '4',
      timestamp: '2026-07-30 11:15:44',
      user: 'unknown@external.com',
      role: 'guest',
      action: 'FAILED_LOGIN_ATTEMPT',
      details: '3 consecutive failed password login attempts',
      severity: 'Warning',
      ip: '203.0.113.42',
    },
    {
      id: '5',
      timestamp: '2026-07-30 09:10:00',
      user: 'admin@college.edu',
      role: 'admin',
      action: 'DELETE_SUBJECT',
      details: 'Deleted subject code CS-999',
      severity: 'Critical',
      ip: '192.168.1.102',
    },
  ];

  const filteredLogs = sampleLogs.filter((log) => {
    const matchesSeverity = !severityFilter || log.severity === severityFilter;
    const matchesSearch =
      !searchQuery ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-[#121038] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-950">
          <div className="relative z-10 space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors mb-1"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FileText className="text-indigo-400" size={30} />
              System Activity & Security Audit Logs
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Timestamped audit trail tracking user authentication, role updates, test submissions, and security anomalies.
            </p>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Logged Events</span>
              <p className="text-2xl font-black text-slate-800">{sampleLogs.length} Events</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Info size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Info Logs</span>
              <p className="text-2xl font-black text-slate-800">
                {sampleLogs.filter((l) => l.severity === 'Info').length} Logs
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Warnings</span>
              <p className="text-2xl font-black text-slate-800">
                {sampleLogs.filter((l) => l.severity === 'Warning').length} Warnings
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-rose-500">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Critical Alerts</span>
              <p className="text-2xl font-black text-slate-800">
                {sampleLogs.filter((l) => l.severity === 'Critical').length} Critical
              </p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user, action, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                <Filter size={15} />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Severities</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    TIMESTAMP
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    USER
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ACTION
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    EVENT DETAILS
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    SEVERITY
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    IP ADDRESS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-800">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-indigo-600">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${
                          log.severity === 'Info'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : log.severity === 'Warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-right font-mono text-slate-400">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityLogsPage;
