import { useEffect, useState } from 'react';
import { ArrowLeft, Send, Loader, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Issue, Message } from '../lib/supabase';

type IssueStatusProps = {
  issueId: string;
  onBack: () => void;
  onPayment: (issueId: string) => void;
  onFeedback: (issueId: string) => void;
};

export function IssueStatus({ issueId, onBack, onPayment, onFeedback }: IssueStatusProps) {
  const { user, profile } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadIssueData();
    subscribeToMessages();
  }, [issueId]);

  const loadIssueData = async () => {
    const { data: issueData } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (issueData) {
      setIssue(issueData);
    }

    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });

    if (messagesData) {
      setMessages(messagesData);
    }

    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${issueId}`)
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
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      await supabase.from('messages').insert({
        issue_id: issueId,
        sender: 'user',
        text: newMessage,
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Issue not found</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Issue Details</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                  {getStatusText(issue.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Device Type</p>
                  <p className="text-slate-900">{issue.device_type}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
                  <p className="text-slate-900">{issue.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Uploaded Media</p>
                  {issue.media_type === 'video' ? (
                    <video src={issue.media_url} controls className="w-full rounded-lg" />
                  ) : (
                    <img src={issue.media_url} alt="Issue" className="w-full rounded-lg" />
                  )}
                </div>

                {issue.ai_diagnosis && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">AI Diagnosis</p>
                    <div className="bg-blue-50 p-4 rounded-lg whitespace-pre-line text-sm text-slate-700">
                      {issue.ai_diagnosis}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Messages</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.sender === 'expert'
                          ? 'bg-green-100 text-green-900'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="text-xs mb-1 opacity-70">
                        {message.sender === 'user' ? 'You' : message.sender === 'expert' ? 'Expert' : 'System'}
                      </div>
                      <p className="whitespace-pre-line">{message.text}</p>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {issue.status !== 'closed' && (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

          <div className="space-y-6">
            {issue.status !== 'consultation_paid' && issue.status !== 'closed' && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                <DollarSign className="w-10 h-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">Upgrade to Live Consultation</h3>
                <p className="text-blue-100 mb-4">
                  Get personalized guidance from our expert technicians via video call.
                </p>
                <div className="text-3xl font-bold mb-4">₹199</div>
                <button
                  onClick={() => onPayment(issueId)}
                  className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Book Now
                </button>
              </div>
            )}

            {issue.status === 'closed' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-900">Issue Resolved</h3>
                <p className="text-slate-600 mb-4">
                  We hope we were able to help you fix your issue!
                </p>
                <button
                  onClick={() => onFeedback(issueId)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Leave Feedback
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 text-slate-900">Issue Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-slate-900">Issue Submitted</p>
                    <p className="text-slate-500">{new Date(issue.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {issue.ai_diagnosis && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium text-slate-900">AI Diagnosis Complete</p>
                      <p className="text-slate-500">{new Date(issue.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {issue.status === 'closed' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-slate-600 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium text-slate-900">Issue Closed</p>
                      <p className="text-slate-500">{new Date(issue.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
