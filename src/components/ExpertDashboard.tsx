import { useEffect, useState } from 'react';
import { ArrowLeft, Send, Loader, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Issue, Message } from '../lib/supabase';

type ExpertDashboardProps = {
  onBack: () => void;
};

export function ExpertDashboard({ onBack }: ExpertDashboardProps) {
  const { profile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'expert_reply' | 'closed'>('all');

  useEffect(() => {
    if (profile?.is_expert) {
      loadIssues();
    }
  }, [profile, filter]);

  useEffect(() => {
    if (selectedIssue) {
      loadMessages(selectedIssue.id);
      subscribeToMessages(selectedIssue.id);
    }
  }, [selectedIssue]);

  const loadIssues = async () => {
    setLoading(true);
    let query = supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;

    if (data) {
      setIssues(data);
    }
    setLoading(false);
  };

  const loadMessages = async (issueId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = (issueId: string) => {
    const channel = supabase
      .channel(`expert-messages:${issueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `issue_id=eq.${issueId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIssue) return;

    setSending(true);
    try {
      await supabase.from('messages').insert({
        issue_id: selectedIssue.id,
        sender: 'expert',
        text: newMessage,
      });

      await supabase
        .from('issues')
        .update({ status: 'expert_reply' })
        .eq('id', selectedIssue.id);

      setNewMessage('');
      loadIssues();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleCloseIssue = async () => {
    if (!selectedIssue) return;

    const confirmed = confirm('Are you sure you want to close this issue?');
    if (!confirmed) return;

    await supabase
      .from('issues')
      .update({ status: 'closed' })
      .eq('id', selectedIssue.id);

    setSelectedIssue(null);
    loadIssues();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expert_reply':
        return 'bg-blue-100 text-blue-800';
      case 'consultation_paid':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (!profile?.is_expert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">You do not have expert access</p>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Expert Dashboard</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'open', 'expert_reply', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        selectedIssue?.id === issue.id
                          ? 'bg-blue-50 border-2 border-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{issue.device_type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{issue.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {issues.length === 0 && (
                    <p className="text-center text-slate-600 py-8">No issues found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedIssue ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Issue Details</h2>
                    <div className="flex gap-2">
                      {selectedIssue.status !== 'closed' && (
                        <button
                          onClick={handleCloseIssue}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Close Issue
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedIssue(null)}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Device Type</p>
                        <p className="text-slate-900">{selectedIssue.device_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIssue.status)}`}>
                          {selectedIssue.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
                      <p className="text-slate-900">{selectedIssue.description}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Media</p>
                      {selectedIssue.media_type === 'video' ? (
                        <video src={selectedIssue.media_url} controls className="w-full rounded-lg max-h-96" />
                      ) : (
                        <img src={selectedIssue.media_url} alt="Issue" className="w-full rounded-lg max-h-96 object-contain" />
                      )}
                    </div>

                    {selectedIssue.ai_diagnosis && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">AI Diagnosis</p>
                        <div className="bg-blue-50 p-4 rounded-lg whitespace-pre-line text-sm text-slate-700">
                          {selectedIssue.ai_diagnosis}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">Messages</h3>

                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'expert' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-lg ${
                            message.sender === 'expert'
                              ? 'bg-green-600 text-white'
                              : message.sender === 'user'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <div className="text-xs mb-1 opacity-70">
                            {message.sender === 'expert' ? 'You' : message.sender === 'user' ? 'User' : 'System'}
                          </div>
                          <p className="whitespace-pre-line">{message.text}</p>
                          <div className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedIssue.status !== 'closed' && (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your expert advice..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sending ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-slate-600">Select an issue to view details and respond</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
