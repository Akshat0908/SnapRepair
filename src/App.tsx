import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { SubmitIssue } from './components/SubmitIssue';
import { IssueStatus } from './components/IssueStatus';
import { ExpertDashboard } from './components/ExpertDashboard';
import { PaymentPage } from './components/PaymentPage';
import { FeedbackForm } from './components/FeedbackForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabaseDB } from './lib/db_supabase';

type PageState =
  | { type: 'landing' }
  | { type: 'submit-issue' }
  | { type: 'issue-status'; issueId: string }
  | { type: 'expert-dashboard' }
  | { type: 'payment'; issueId: string }
  | { type: 'feedback'; issueId: string };

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState<PageState>({ type: 'landing' });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-redirect after login
  React.useEffect(() => {
    if (user && page.type === 'landing') {
      handleGetStarted();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleGetStarted = async () => {
    if (user) {
      if (user.email.includes('expert')) {
        setPage({ type: 'expert-dashboard' });
      } else {
        try {
          const issues = await supabaseDB.getIssues(user.id);
          if (issues.length > 0) {
            setPage({ type: 'issue-status', issueId: issues[0].id });
          } else {
            setPage({ type: 'submit-issue' });
          }
        } catch (error) {
          console.error("Error fetching issues:", error);
          setPage({ type: 'submit-issue' });
        }
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setPage({ type: 'landing' });
  };

  const renderPage = () => {
    switch (page.type) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'submit-issue':
        return <SubmitIssue onBack={() => setPage({ type: 'landing' })} onSuccess={(issueId) => setPage({ type: 'issue-status', issueId })} />;
      case 'issue-status':
        return (
          <IssueStatus
            issueId={page.issueId}
            onBack={() => setPage({ type: 'landing' })}
            onPayment={(issueId) => setPage({ type: 'payment', issueId })}
            onFeedback={(issueId) => setPage({ type: 'feedback', issueId })}
          />
        );
      case 'expert-dashboard':
        return <ExpertDashboard onViewIssue={(id) => setPage({ type: 'issue-status', issueId: id })} onLogout={handleLogout} />;
      case 'payment':
        return (
          <PaymentPage
            issueId={page.issueId}
            onBack={() => setPage({ type: 'issue-status', issueId: page.issueId })}
            onSuccess={() => setPage({ type: 'issue-status', issueId: page.issueId })}
          />
        );
      case 'feedback':
        return (
          <FeedbackForm
            issueId={page.issueId}
            onClose={() => setPage({ type: 'issue-status', issueId: page.issueId })}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      {page.type !== 'landing' && (
        <nav className="fixed top-0 left-0 right-0 z-40 transition-all bg-white/80 backdrop-blur-md border-b border-orange-100 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div
              className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-2"
              onClick={() => setPage({ type: 'landing' })}
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-slate-900">
                Snap<span className="text-orange-500">Repair</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold hidden md:block text-slate-600">
                    Hi, {user.name}
                  </span>
                  {user.email.includes('expert') && page.type !== 'expert-dashboard' && (
                    <button
                      onClick={() => setPage({ type: 'expert-dashboard' })}
                      className="text-sm font-bold hover:opacity-80 text-orange-600"
                    >
                      Dashboard
                    </button>
                  )}
                  {!user.email.includes('expert') && page.type !== 'submit-issue' && (
                    <button
                      onClick={() => setPage({ type: 'submit-issue' })}
                      className="text-sm font-bold hover:opacity-80 text-orange-600"
                    >
                      New Issue
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 text-sm font-bold rounded-xl transition-all bg-orange-50 text-orange-600 hover:bg-orange-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className={page.type === 'landing' ? '' : 'pt-20'}>
        {renderPage()}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-auto text-sm">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
