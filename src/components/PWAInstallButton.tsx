import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePWAContext } from '@/contexts/PWAContext';

interface PWAInstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  publicMode?: boolean; // allow use without auth
}

export function PWAInstallButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  publicMode = false,
}: PWAInstallButtonProps) {
  const { isPWAInstalled, hasInstallPrompt, openPrompt } = usePWAContext();
  const [showManualInstall, setShowManualInstall] = useState(false);

  const handleClick = () => {
    if (hasInstallPrompt) {
      // Open centralized install prompt
      openPrompt();
    } else {
      // Show manual installation instructions
      setShowManualInstall(true);
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = 'To install WalletWala on iOS:\n\n1. Tap the Share button (square with arrow) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm\n\nNote: Make sure you\'re using Safari browser';
    } else if (isAndroid) {
      if (isChrome) {
        instructions = 'To install WalletWala on Android:\n\n1. Tap the menu button (three dots) in Chrome\n2. Tap "Add to Home screen"\n3. Tap "Add" to confirm\n\nNote: Make sure you\'re using Chrome browser';
      } else {
        instructions = 'To install WalletWala on Android:\n\n1. Open this site in Chrome browser\n2. Tap the menu button (three dots)\n3. Tap "Add to Home screen"\n4. Tap "Add" to confirm';
      }
    } else if (isChrome || isEdge) {
      instructions = 'To install WalletWala on Desktop:\n\n1. Look for the install icon (↓) in the address bar\n2. If not visible, try refreshing the page\n3. Or use the browser menu: ⋮ → "Install WalletWala"\n\nNote: The install icon may take a moment to appear';
    } else if (isFirefox) {
      instructions = 'To install WalletWala on Firefox:\n\n1. Look for the install icon in the address bar\n2. Or use the menu: ☰ → "Install App"\n3. Click "Install" to confirm\n\nNote: Firefox PWA support may vary';
    } else {
      instructions = 'To install WalletWala:\n\n1. Try refreshing the page\n2. Look for an install icon in your browser\'s address bar\n3. Check your browser\'s menu for "Add to Home Screen" or "Install App"\n\nNote: PWA installation support varies by browser';
    }
    
    alert(instructions);
  };

  // Don't show button if app is already installed
  if (isPWAInstalled) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${className} transition-all duration-200`}
        title="Install WalletWala App"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

    </>
  );
} 