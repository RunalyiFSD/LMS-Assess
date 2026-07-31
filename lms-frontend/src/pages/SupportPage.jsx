import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Sample Support Tickets
  const [tickets, setTickets] = useState([
    {
      id: 'TICK-1001',
      user: 'student1@college.edu',
      subject: 'Code Submission Sandbox Timeout Error',
      category: 'Technical Issue',
      priority: 'High',
      status: 'Open',
      createdAt: '2026-07-30 11:20',
      messages: [
        { sender: 'student1@college.edu', body: 'When submitting my Javascript solution for Sum of Two Numbers, the sandbox times out after 10s.', timestamp: '2026-07-30 11:20' }
      ]
    },
    {
      id: 'TICK-1002',
      user: 'instructor@college.edu',
      subject: 'Question Bank MCQ Grading Formula Query',
      category: 'Assessment Question',
      priority: 'Medium',
      status: 'In-Progress',
      createdAt: '2026-07-30 10:15',
      messages: [
        { sender: 'instructor@college.edu', body: 'How do negative marks get calculated for Moderate difficulty MCQs?', timestamp: '2026-07-30 10:15' },
        { sender: 'admin@college.edu', body: 'Negative marks are subtracted directly from total score obtained.', timestamp: '2026-07-30 10:45' }
      ]
    },
    {
      id: 'TICK-1003',
      user: 'student2@college.edu',
      subject: 'Password Reset & Account Access',
      category: 'Account Access',
      priority: 'Low',
      status: 'Resolved',
      createdAt: '2026-07-29 16:30',
      messages: [
        { sender: 'student2@college.edu', body: 'My password was reset by mistake.', timestamp: '2026-07-29 16:30' }
      ]
    }
  ]);

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In-Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const newMsg = {
      sender: 'admin@college.edu',
      body: replyMessage,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, status: 'In-Progress', messages: [...t.messages, newMsg] }
          : t
      )
    );

    setSelectedTicket((prev) => ({
      ...prev,
      status: 'In-Progress',
      messages: [...prev.messages, newMsg],
    }));

    setReplyMessage('');
  };

  const handleMarkResolved = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, status: 'Resolved' }));
    }
  };

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
              <Headphones className="text-purple-400" size={30} />
              Helpdesk & Support Ticketing Hub
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Student and instructor technical support inquiries, score resolution requests, and account assistance tickets.
            </p>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Headphones size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Support Tickets</span>
              <p className="text-2xl font-black text-slate-800">{tickets.length} Tickets</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-rose-500">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Open Tickets</span>
              <p className="text-2xl font-black text-slate-800">{openCount} Pending</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">In-Progress</span>
              <p className="text-2xl font-black text-slate-800">{inProgressCount} Active</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Resolved Tickets</span>
              <p className="text-2xl font-black text-slate-800">{resolvedCount} Closed</p>
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
                placeholder="Search ticket by ID, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                <Filter size={15} />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Support Tickets Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    TICKET ID
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    USER EMAIL
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    SUBJECT
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    PRIORITY
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-600">
                      {t.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-800">
                      {t.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                      {t.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${
                          t.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : t.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${
                          t.status === 'Open'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : t.status === 'In-Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-right space-x-2">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg font-semibold transition-colors"
                      >
                        Reply / View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: View & Reply to Ticket */}
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket?.id} — ${selectedTicket?.subject}`}
        >
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">Submitted by: {selectedTicket.user}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{selectedTicket.status}</span>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                {selectedTicket.messages.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>{m.sender}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700">{m.body}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {selectedTicket.status !== 'Resolved' && (
                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type official support response..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(selectedTicket.id)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Mark Resolved
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-1"
                    >
                      <Send size={14} /> Send Reply
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default SupportPage;
