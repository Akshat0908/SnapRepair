import { useEffect, useState } from 'react';
import { Plus, Eye, Wrench, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Issue } from '../lib/supabase';

type UserDashboardProps = {
  onBack: () => void;
  onNewIssue: () => void;
  onViewIssue: (issueId: string) => void;
  onExpertDashboard: () => void;
};

export function UserDashboard({ onBack, onNewIssue, onViewIssue, onExpertDashboard }: UserDashboardProps) {
  const { profile, signOut } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setIssues(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'expert_reply':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'consultation_paid':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'pending':
        return 'Processing';
      case 'expert_reply':
        return 'Expert Replied';
      case 'payment_needed':
        return 'Payment Needed';
      case 'consultation_paid':
        return 'Consultation Paid';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SnapRepair</span>
            </button>
            <div className="flex items-center gap-4">
              {profile?.is_expert && (
                <button
                  onClick={onExpertDashboard}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
                >
                  Expert Dashboard
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Issues</h1>
            <p className="text-gray-600">Welcome back, <span className="font-semibold text-orange-600">{profile?.name}</span></p>
          </div>
          <button
            onClick={onNewIssue}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Issue
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading your issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Issues Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Submit your first repair issue to get started with AI diagnosis and expert support
            </p>
            <button
              onClick={onNewIssue}
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Submit Your First Issue
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {issue.media_type === 'video' ? (
                    <video
                      src={issue.media_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={issue.media_url}
                      alt="Issue"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(issue.status)}`}>
                      {getStatusText(issue.status)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-orange-600 uppercase">{issue.device_type}</span>
                  </div>
                  <p className="text-gray-900 font-semibold mb-4 line-clamp-2">{issue.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <button
                      onClick={() => onViewIssue(issue.id)}
                      className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition flex items-center gap-1"
                    >
                      View
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
