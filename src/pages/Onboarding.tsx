import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { SkillLevelChoice } from '@/components/onboarding/SkillLevelChoice';
import { BeginnerFlow } from '@/components/onboarding/BeginnerFlow';
import { AdvancedFlow } from '@/components/onboarding/AdvancedFlow';

type OnboardingStep = 'welcome' | 'skill-level' | 'beginner' | 'advanced';

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Welcome | Receipt Zen';
    
    // Redirect if not authenticated
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleWelcomeContinue = () => {
    setStep('skill-level');
  };

  const handleBeginnerSelect = () => {
    setStep('beginner');
  };

  const handleAdvancedSelect = () => {
    setStep('advanced');
  };

  const handleComplete = () => {
    // Mark onboarding as complete in localStorage
    localStorage.setItem('onboarding_complete', 'true');
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