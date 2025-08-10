import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PWAInstallButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '' 
}: PWAInstallButtonProps) {
  const { showInstallPrompt, dismissPrompt, handleInstall, isPWAInstalled, hasInstallPrompt } = usePWA();
  const [showManualInstall, setShowManualInstall] = useState(false);

  const handleClick = () => {
    if (hasInstallPrompt) {
      // Show the PWA prompt
      setShowManualInstall(false);
    } else {
      // Show manual installation instructions
      setShowManualInstall(true);
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      alert('To install ReceiptWala:\n\n1. Tap the Share button (square with arrow) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
    } else if (isAndroid) {
      alert('To install ReceiptWala:\n\n1. Tap the menu button (three dots) in Chrome\n2. Tap "Add to Home screen"\n3. Tap "Add" to confirm');
    } else {
      alert('To install ReceiptWala:\n\nLook for the install icon in your browser\'s address bar or menu, then click "Install"');
    }
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
        title="Install ReceiptWala App"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

      {/* PWA Install Prompt Modal */}
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-large">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Install ReceiptWala</h3>
                <p className="text-sm text-muted-foreground">Get the app for a better experience</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span>Scan receipts with AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span>Track expenses offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span>Get financial insights</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
              <Button 
                variant="outline" 
                onClick={dismissPrompt}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 