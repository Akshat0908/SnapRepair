import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { SubmitIssue } from './components/SubmitIssue';
import { IssueStatus } from './components/IssueStatus';
import { ExpertDashboard } from './components/ExpertDashboard';
import { PaymentPage } from './components/PaymentPage';
import { FeedbackForm } from './components/FeedbackForm';
import { Loader } from 'lucide-react';

type Page =
  | { type: 'landing' }
  | { type: 'dashboard' }
  | { type: 'submit-issue' }
  | { type: 'issue-status'; issueId: string }
  | { type: 'expert-dashboard' }
  | { type: 'payment'; issueId: string }
  | { type: 'feedback'; issueId: string };

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>({ type: 'landing' });
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      setPage({ type: 'dashboard' });
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setPage({ type: 'dashboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user && page.type !== 'landing') {
    setPage({ type: 'landing' });
  }

  if (user && page.type === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={() => setPage({ type: 'dashboard' })} />
      </>
    );
  }

  switch (page.type) {
    case 'landing':
      return (
        <>
          <LandingPage onGetStarted={handleGetStarted} />
          {showAuthModal && <AuthModal onClose={handleAuthSuccess} />}
        </>
      );

    case 'dashboard':
      return (
        <UserDashboard
          onBack={() => setPage({ type: 'landing' })}
          onNewIssue={() => setPage({ type: 'submit-issue' })}
          onViewIssue={(issueId) => setPage({ type: 'issue-status', issueId })}
          onExpertDashboard={() => setPage({ type: 'expert-dashboard' })}
        />
      );

    case 'submit-issue':
      return (
        <SubmitIssue
          onBack={() => setPage({ type: 'dashboard' })}
          onSuccess={(issueId) => setPage({ type: 'issue-status', issueId })}
        />
      );

    case 'issue-status':
      return (
        <IssueStatus
          issueId={page.issueId}
          onBack={() => setPage({ type: 'dashboard' })}
          onPayment={(issueId) => setPage({ type: 'payment', issueId })}
          onFeedback={(issueId) => setPage({ type: 'feedback', issueId })}
        />
      );

    case 'expert-dashboard':
      return (
        <ExpertDashboard
          onBack={() => setPage({ type: 'dashboard' })}
        />
      );

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
          onBack={() => setPage({ type: 'issue-status', issueId: page.issueId })}
          onSuccess={() => setPage({ type: 'dashboard' })}
        />
      );

    default:
      return (
        <LandingPage onGetStarted={handleGetStarted} />
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
