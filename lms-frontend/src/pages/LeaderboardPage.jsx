import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import api from '../services/api';
import { Search, Filter, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter conditions
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'completed' | 'latest'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch subjects list
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.data?.status === 'success') {
          setSubjects(res.data.data.subjects || []);
        }
      } catch (err) {
        console.warn('Failed to load subjects list');
      }
    };
    fetchSubjects();
  }, []);

  // Fetch rankings on change
  const fetchRankings = async () => {
    setLoading(true);
    let fetchedRankings = [];
    let fetchedTotalPages = 1;
    try {
      const params = {
        page,
        limit: 10,
        sortBy,
      };
      if (search) params.search = search;
      if (subject) params.subject = subject;
      if (batch) params.batch = batch;
      if (type) params.type = type;

      const res = await axios.get('http://localhost:5000/api/public/leaderboard', { params });
      if (res.data?.status === 'success') {
        fetchedRankings = res.data.data.rankings || [];
        fetchedTotalPages = res.data.totalPages || 1;
      }
    } catch (err) {
      console.warn('Failed to load global standings');
    } finally {
      setRankings(fetchedRankings);
      setTotalPages(fetchedTotalPages);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [page, subject, type, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRankings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSubject('');
    setBatch('');
    setType('');
    setSortBy('score');
    setPage(1);
  };

  // Define table columns matching requirements
  const columns = [
    {
      header: 'Rank',
      accessor: (row) => (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${row.rank === 1 ? 'bg-amber-100 text-amber-800' :
          row.rank === 2 ? 'bg-slate-100 text-slate-700' :
            row.rank === 3 ? 'bg-orange-100 text-orange-800' :
              'text-slate-500'
          }`}>
          {row.rank}
        </span>
      ),
    },
    {
      header: 'Student Name',
      accessor: (row) => (
        <Link
          to={`/profile/${row.student._id}`}
          className="font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-2"
        >
          {row.student.name}
          <span className="text-[10px] text-slate-400 font-normal">({row.student.batch || 'N/A'})</span>
        </Link>
      ),
    },
    {
      header: 'Overall Points',
      accessor: (row) => <span className="font-bold text-slate-800">{row.totalScore} pts</span>,
    },
    {
      header: 'Assessments Completed',
      accessor: 'assessmentsCompleted',
    },
    {
      header: 'Success Rate (Avg %)',
      accessor: (row) => `${row.avgPercentage}%`,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/profile/${row.student._id}`)} className="gap-1.5 text-xs py-1">
          View Profile <ArrowRight size={12} />
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors mb-3">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Leaderboard Rankings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Standings based on accumulated assessment points</p>
        </div>
      </div>

      {/* Filter Options */}
      <Card className="mb-6 p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>

            {/* Filter by Subject */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="">Filter by Subject</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>

            {/* Filter by Batch */}
            <input
              type="text"
              placeholder="Filter by Batch (e.g. 2026)"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />

            {/* Filter by Assessment Type */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="">Filter by Test Type</option>
              <option value="mcq">MCQ Assessment</option>
              <option value="coding">Coding Assessment</option>
              <option value="theory">Theory Assessment</option>
            </select>

            {/* Sort Criteria */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="score">Sort by Score</option>
              <option value="completed">Sort by Completed</option>
              <option value="latest">Sort by Latest Activity</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button size="sm" variant="outline" type="button" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button size="sm" type="submit" className="gap-2">
              Apply Filters
            </Button>
          </div>
        </form>
      </Card>

      {/* Standings Grid Table */}
      <Card bodyClassName="p-0">
        <Table
          columns={columns}
          data={rankings}
          loading={loading}
          pagination={{
            page,
            totalPages,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
          }}
          emptyMessage="No students matches the search filters."
        />
      </Card>
    </Layout>
  );
};

export default LeaderboardPage;
