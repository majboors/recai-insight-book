import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { SkillLevelChoice } from '@/components/onboarding/SkillLevelChoice';
import { BeginnerFlow } from '@/components/onboarding/BeginnerFlow';
import { AdvancedFlow } from '@/components/onboarding/AdvancedFlow';
import { supabase } from '@/integrations/supabase/client';

type OnboardingStep = 'welcome' | 'skill-level' | 'beginner' | 'advanced';

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Welcome | Receipt Zen';

    if (loading) return; // Wait for auth to settle before redirecting

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const key = `onboarding_complete:${user.id}`;
    const legacy = localStorage.getItem('onboarding_complete') === 'true';
    const local = localStorage.getItem(key) === 'true' || legacy;
    const meta = Boolean((user as any)?.user_metadata?.onboarding_complete);

    // Migrate legacy flag to user-specific flag
    if (legacy && !localStorage.getItem(key)) {
      localStorage.setItem(key, 'true');
    }

    if (local || meta) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleWelcomeContinue = () => {
    setStep('skill-level');
  };

  const handleBeginnerSelect = async () => {
    setStep('beginner');
  };
 
  const handleAdvancedSelect = async () => {
    setStep('advanced');
  };

  const handleComplete = async () => {
    if (!user) return;
    const key = `onboarding_complete:${user.id}`;
    localStorage.setItem(key, 'true');
    // Clean up legacy flag
    localStorage.removeItem('onboarding_complete');
    try {
      await supabase.auth.updateUser({ data: { onboarding_complete: true } });
    } catch (e) {
      console.warn('Failed to update user metadata for onboarding:', e);
    }
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {step === 'welcome' && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}
      
      {step === 'skill-level' && (
        <SkillLevelChoice 
          onBeginnerSelect={handleBeginnerSelect}
          onAdvancedSelect={handleAdvancedSelect}
        />
      )}
      
      {step === 'beginner' && (
        <BeginnerFlow onComplete={handleComplete} />
      )}
      
      {step === 'advanced' && (
        <AdvancedFlow onComplete={handleComplete} />
      )}
    </div>
  );
}