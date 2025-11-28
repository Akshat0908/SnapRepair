import React, { useState, useEffect } from 'react';
import { supabaseDB } from '../lib/db_supabase';
import { Issue } from '../lib/db';
import { MessageSquare, CheckCircle, Clock, Search, Filter, ArrowRight } from 'lucide-react';

interface ExpertDashboardProps {
  onViewIssue: (issueId: string) => void;
  onLogout?: () => void; // Optional prop if we want to use it
}

export function ExpertDashboard({ onViewIssue }: ExpertDashboardProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const allIssues = await supabaseDB.getAllIssues();
        setIssues(allIssues);
      } catch (error) {
        console.error("Error loading issues:", error);
      }
    };
    loadIssues();
    const interval = setInterval(loadIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all'
      ? true
      : filter === 'open'
        ? issue.status !== 'Closed'
        : issue.status === 'Closed';

    const matchesSearch = issue.description.toLowerCase().includes(search.toLowerCase()) ||
      issue.device_type.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expert Dashboard</h1>
            <p className="text-slate-600">Manage and respond to repair requests</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'open' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'resolved' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No issues found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => onViewIssue(issue.id)}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {issue.media_url && (
                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={issue.media_url} alt="Issue" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${issue.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                        issue.status === 'Expert Replied' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {issue.status}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {issue.device_type} Issue
                    </h3>
                    <p className="text-slate-600 line-clamp-2 mb-3">{issue.description}</p>

                    {issue.ai_diagnosis && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        AI Diagnosis Available
                      </div>
                    )}
                  </div>

                  <div className="flex items-center self-center text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
