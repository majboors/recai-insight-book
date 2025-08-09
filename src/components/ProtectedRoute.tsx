import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine onboarding completion (user-specific + metadata)
  const completed = (() => {
    if (!user) return false;
    const key = `onboarding_complete:${user.id}`;
    const local = localStorage.getItem(key) === 'true' || localStorage.getItem('onboarding_complete') === 'true';
    const meta = Boolean((user as any)?.user_metadata?.onboarding_complete);
    return local || meta;
  })();
  const inOnboarding = location.pathname === '/onboarding';

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (!completed && !inOnboarding) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, loading, navigate, inOnboarding, completed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!completed && !inOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}