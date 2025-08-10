import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function usePWA() {
  const { user } = useAuth();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [hasInstallPrompt, setHasInstallPrompt] = useState(false);

  useEffect(() => {
    // Only show prompt for logged-in users
    if (!user) return;

    // Check if already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      if (isStandalone || isIOSStandalone) {
        setIsPWAInstalled(true);
        return true;
      }
      return false;
    };

    // Check if user has dismissed the prompt recently
    const checkDismissed = () => {
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours
        
        // Show again after 24 hours
        if (now - dismissedTime < oneDay) {
          return true; // Still dismissed
        } else {
          localStorage.removeItem('pwa_prompt_dismissed');
        }
      }
      return false;
    };

    // Check if user has installed the app
    const checkInstalled = () => {
      const installed = localStorage.getItem('pwa_installed');
      if (installed === 'true') {
        setIsPWAInstalled(true);
        return true;
      }
      return false;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setHasInstallPrompt(true);
      
      // Show prompt after a delay if not dismissed and not installed
      if (!checkDismissed() && !checkInstalled() && !checkIfInstalled()) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    // Initial checks
    if (!checkDismissed() && !checkInstalled() && !checkIfInstalled()) {
      // Show prompt after a delay for users who might not have the beforeinstallprompt event
      setTimeout(() => {
        if (!hasInstallPrompt && !isPWAInstalled) {
          setShowInstallPrompt(true);
        }
      }, 5000); // Show after 5 seconds if no beforeinstallprompt event
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [user, hasInstallPrompt, isPWAInstalled]);

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstall = () => {
    localStorage.setItem('pwa_installed', 'true');
    setIsPWAInstalled(true);
    setShowInstallPrompt(false);
  };

  return {
    showInstallPrompt,
    isPWAInstalled,
    hasInstallPrompt,
    dismissPrompt,
    handleInstall,
  };
} 