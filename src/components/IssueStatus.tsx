import React, { useEffect, useState } from 'react';
import { ArrowLeft, Send, Loader, DollarSign, Shield, AlertTriangle, CheckCircle, User as UserIcon, MessageSquare, Download, Share2, Wrench, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDB } from '../lib/db_supabase';
import { Issue, Message } from '../lib/db';
import { chatWithExpert } from '../lib/ai';
import { Stepper } from './ui/Stepper';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type IssueStatusProps = {
  issueId: string;
  onBack: () => void;
  onPayment: (issueId: string) => void;
  onFeedback: (issueId: string) => void;
};

export function IssueStatus({ issueId, onBack, onPayment, onFeedback }: IssueStatusProps) {
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);


  useEffect(() => {
    loadIssueData();
    const interval = setInterval(loadIssueData, 2000); // Poll for updates
    return () => clearInterval(interval);
  }, [issueId]);

  const loadIssueData = async () => {
    try {
      const issueData = await supabaseDB.getIssue(issueId);
      setIssue(issueData);

      const msgs = await supabaseDB.getMessages(issueId);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading issue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !issue) return;

    setSending(true);
    try {
      // Add user message
      const userMsg = await supabaseDB.addMessage(issue.id, 'user', newMessage);
      setMessages(prev => [...prev, userMsg]);
      setNewMessage('');

      // Simulate AI/Expert response if needed
      if (issue.status === 'open' || issue.status === 'Open') {
        const chatHistory = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })) as { role: 'user' | 'assistant' | 'system', content: string }[];

        chatHistory.push({ role: 'user', content: newMessage });

        // Add system context
        chatHistory.unshift({
          role: 'system',
          content: `You are a helpful home repair expert. The user has an issue with their ${issue.device_type}. Description: ${issue.description}. AI Diagnosis: ${JSON.stringify(issue.ai_diagnosis)}`
        });

        const aiResponse = await chatWithExpert(chatHistory);
        const expertMsg = await supabaseDB.addMessage(issue.id, 'expert', aiResponse);
        setMessages(prev => [...prev, expertMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getSteps = (status: string) => {
    const s = status.toLowerCase();
    return [
      {
        title: 'Issue Submitted',
        status: 'Received',
        completed: true,
        active: false,
        time: issue ? new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      },
      {
        title: 'AI Diagnosis',
        status: 'Analyzed',
        completed: s !== 'open' && s !== 'pending',
        active: s === 'open' || s === 'pending',
      },
      {
        title: 'Expert Review',
        status: 'In Progress',
        completed: s === 'expert_reply' || s === 'payment_needed' || s === 'consultation_paid' || s === 'closed',
        active: s === 'expert_reply',
      },
      {
        title: 'Resolution',
        status: 'Pending',
        completed: s === 'closed',
        active: s === 'consultation_paid' || s === 'payment_needed',
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!issue) return <div className="p-8 text-center">Issue not found</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="group flex items-center text-slate-600 hover:text-orange-600 mb-8 font-bold bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all w-fit"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Issue Details & Status */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white"
            >
              <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-400"></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {issue.device_type}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                      Repair Status
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors shadow-sm border border-slate-100"
                      title="Share Issue"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors shadow-sm border border-slate-100"
                      title="Download Report"
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="mb-10">
                  <Stepper steps={getSteps(issue.status)} currentStep={0} />
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    Issue Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {issue.description}
                  </p>
                </div>

                {issue.media_url && (
                  <div className="mt-6">
                    <div className="relative group rounded-3xl overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
                      <img
                        src={issue.media_url}
                        alt="Issue"
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-900 z-20 shadow-sm">
                        View Attachment
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Diagnosis Card */}
            {issue.ai_diagnosis && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-[100px] -z-0 pointer-events-none"></div>

                <div className="p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">AI Diagnosis</h2>
                      <p className="text-slate-500 font-medium">Powered by Gemini 1.5 Flash</p>
                    </div>

                    {/* Confidence Meter */}
                    <div className="ml-auto flex flex-col items-center">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-100" />
                          <motion.circle
                            cx="32" cy="32" r="28"
                            stroke="currentColor" strokeWidth="4" fill="none"
                            className="text-green-500"
                            strokeDasharray="175.9"
                            initial={{ strokeDashoffset: 175.9 }}
                            animate={{ strokeDashoffset: 175.9 - (175.9 * 0.94) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <span className="absolute text-sm font-bold text-slate-900">94%</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Confidence</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                      <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Potential Causes
                      </h3>
                      <ul className="space-y-2">
                        {issue.ai_diagnosis.likely_causes.map((cause, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700 font-medium text-sm">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                      <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Recommended Action
                      </h3>
                      <p className="text-slate-700 font-medium text-sm leading-relaxed">
                        {issue.ai_diagnosis.recommended_action}
                      </p>
                      <div className="mt-4 pt-4 border-t border-green-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Est. Cost</span>
                        <span className="text-lg font-black text-slate-900">{issue.ai_diagnosis.estimated_cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      DIY Troubleshooting Steps
                    </h3>
                    <div className="space-y-3">
                      {issue.ai_diagnosis.troubleshooting_steps.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-900 font-bold border border-slate-200 shadow-sm group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-colors">
                            {i + 1}
                          </div>
                          <p className="text-slate-600 font-medium text-sm pt-1.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-4 items-start">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium leading-relaxed">
                      <span className="font-bold block mb-1">Safety Warning</span>
                      {issue.ai_diagnosis.safety_warning}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Chat & Actions */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 h-fit">
            {/* Chat Interface */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white h-[600px] flex flex-col relative">
              <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Expert Support</h3>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Online Now
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 bg-slate-50/50">
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : msg.sender === 'system'
                          ? 'bg-orange-100 text-orange-900 border border-orange-200 w-full text-center text-sm font-medium'
                          : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                        }`}
                    >
                      {msg.sender === 'expert' || msg.sender === 'system' ? (
                        <div className="markdown-content text-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 text-slate-900" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-4 text-slate-900" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1 mt-3 text-slate-900" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1 pl-1" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                              a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-200 pl-4 italic my-2 text-slate-500" {...props} />,
                              hr: ({ node, ...props }) => <hr className="my-4 border-slate-200" {...props} />,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.text}</p>
                      )}
                      {msg.sender !== 'system' && (
                        <p className={`text-[10px] mt-2 font-bold opacity-60 ${msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 rounded-full border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="absolute right-2 top-2 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
                  >
                    {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Maintenance Tip Card (Creative Addition) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Did You Know?</h3>
                </div>
                <p className="text-blue-50 font-medium leading-relaxed text-sm">
                  Regular maintenance can extend your appliance's life by up to 5 years! Check your user manual for specific care instructions.
                </p>
              </div>
            </motion.div>

            {/* Tools Required Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Tools Required</h3>
              </div>
              <ul className="space-y-3">
                {['Screwdriver Set', 'Flashlight', 'Multimeter (Optional)', 'Clean Cloth'].map((tool, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    {tool}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Savings Calculator Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Potential Savings</h3>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black">₹4,500</span>
                  <span className="text-emerald-100 font-medium mb-1">saved</span>
                </div>
                <p className="text-emerald-50 text-sm font-medium">
                  By fixing this yourself, you're saving significantly on professional service fees!
                </p>
              </div>
            </motion.div>

            {/* Upgrade Card */}
            {issue.status !== 'consultation_paid' && issue.status !== 'Consultation Paid' && issue.status !== 'Closed' && issue.status !== 'closed' && (
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] shadow-xl p-8 text-white relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                    <DollarSign className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Live Expert Call</h3>
                  <p className="text-slate-400 mb-8 font-medium leading-relaxed">
                    Stuck? Get on a video call with a certified technician to guide you step-by-step.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-white">₹199</span>
                      <span className="text-slate-500 text-sm ml-2 line-through">₹499</span>
                    </div>
                    <button
                      onClick={() => onPayment(issueId)}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/25"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(issue.status === 'Closed' || issue.status === 'closed') && (
              <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-green-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-slate-900">Issue Resolved</h3>
                <p className="text-slate-600 mb-6 font-medium">
                  We hope we were able to help you fix your issue!
                </p>
                <button
                  onClick={() => onFeedback(issueId)}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20"
                >
                  Leave Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
