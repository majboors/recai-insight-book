import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';

export function PWADebug() {
  const [pwaStatus, setPwaStatus] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkPWAStatus = async () => {
    setIsLoading(true);
    
    const status = {
      // Browser detection
      userAgent: navigator.userAgent,
      isChrome: /Chrome/.test(navigator.userAgent),
      isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
      isFirefox: /Firefox/.test(navigator.userAgent),
      isEdge: /Edg/.test(navigator.userAgent),
      isMobile: /Android|iPhone|iPad|iPod/.test(navigator.userAgent),
      
      // PWA support
      hasServiceWorker: 'serviceWorker' in navigator,
      hasBeforeInstallPrompt: false,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isIOSStandalone: (window.navigator as any).standalone === true,
      
      // Service Worker details
      swRegistered: false,
      swController: false,
      swError: null,
      swRegistrations: [] as readonly ServiceWorkerRegistration[],
      
      // Manifest
      hasManifest: false,
      manifestUrl: '/manifest.json',
      
      // HTTPS
      isHTTPS: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      
      // Installation status
      isInstalled: false,
      canInstall: false
    };

    // Check if manifest exists
    try {
      const manifestResponse = await fetch('/manifest.json');
      status.hasManifest = manifestResponse.ok;
    } catch (error) {
      status.hasManifest = false;
    }

    // Check service worker status
    if (status.hasServiceWorker) {
      try {
        // Check if service worker is registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        status.swRegistrations = registrations;
        status.swRegistered = registrations.length > 0;
        
        // Check if service worker is controlling the page
        status.swController = !!navigator.serviceWorker.controller;
        
        console.log('Service Worker registrations:', registrations);
        console.log('Service Worker controller:', navigator.serviceWorker.controller);
        
        // Try to register service worker if not registered
        if (!status.swRegistered) {
          try {
            console.log('Attempting to register service worker...');
            const registration = await navigator.serviceWorker.register('/sw.js', { 
              scope: '/',
              updateViaCache: 'none'
            });
            status.swRegistered = !!registration;
            console.log('Service Worker registered in debug:', registration);
          } catch (error) {
            status.swError = error;
            console.error('Service Worker registration failed in debug:', error);
          }
        }
      } catch (error) {
        status.swError = error;
        console.error('Service Worker check failed:', error);
      }
    }

    // Check if already installed
    status.isInstalled = status.isStandalone || status.isIOSStandalone;
    
    // Check if can install (basic criteria)
    status.canInstall = status.hasServiceWorker && 
                       status.hasManifest && 
                       (status.isHTTPS || status.isLocalhost) &&
                       !status.isInstalled;

    setPwaStatus(status);
    setIsLoading(false);
  };

  useEffect(() => {
    checkPWAStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const getStatusBadge = (condition: boolean) => {
    return condition ? (
      <Badge variant="secondary" className="text-success">✓</Badge>
    ) : (
      <Badge variant="destructive">✗</Badge>
    );
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Info className="h-4 w-4 mr-2" />
        PWA Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="card-zen">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">PWA Debug Info</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs">
            Browser compatibility and installation status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Browser Info */}
          <div className="space-y-2">
            <div className="font-medium">Browser Detection:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(pwaStatus.isChrome)}
                <span>Chrome</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(pwaStatus.isSafari)}
                <span>Safari</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(pwaStatus.isFirefox)}
                <span>Firefox</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(pwaStatus.isEdge)}
                <span>Edge</span>
              </div>
            </div>
          </div>

          {/* Service Worker Details */}
          <div className="space-y-2">
            <div className="font-medium">Service Worker:</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>Supported</span>
                {getStatusBadge(pwaStatus.hasServiceWorker)}
              </div>
              <div className="flex items-center justify-between">
                <span>Registered</span>
                {getStatusBadge(pwaStatus.swRegistered)}
              </div>
              <div className="flex items-center justify-between">
                <span>Controlling</span>
                {getStatusBadge(pwaStatus.swController)}
              </div>
              {pwaStatus.swError && (
                <div className="text-destructive text-xs mt-1">
                  Error: {pwaStatus.swError.message}
                </div>
              )}
            </div>
          </div>

          {/* PWA Requirements */}
          <div className="space-y-2">
            <div className="font-medium">PWA Requirements:</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>Manifest</span>
                {getStatusBadge(pwaStatus.hasManifest)}
              </div>
              <div className="flex items-center justify-between">
                <span>HTTPS/Localhost</span>
                {getStatusBadge(pwaStatus.isHTTPS || pwaStatus.isLocalhost)}
              </div>
              <div className="flex items-center justify-between">
                <span>Not Already Installed</span>
                {getStatusBadge(!pwaStatus.isInstalled)}
              </div>
            </div>
          </div>

          {/* Installation Status */}
          <div className="space-y-2">
            <div className="font-medium">Installation Status:</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>Can Install</span>
                {getStatusBadge(pwaStatus.canInstall)}
              </div>
              <div className="flex items-center justify-between">
                <span>Already Installed</span>
                {getStatusBadge(pwaStatus.isInstalled)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t space-y-2">
            <Button
              size="sm"
              onClick={checkPWAStatus}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Checking...' : 'Refresh Status'}
            </Button>
            
            {!pwaStatus.swRegistered && pwaStatus.hasServiceWorker && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    console.log('Manual registration attempt...');
                    const registration = await navigator.serviceWorker.register('/sw.js', { 
                      scope: '/',
                      updateViaCache: 'none'
                    });
                    console.log('Manual SW registration success:', registration);
                    alert('Service Worker registered successfully!');
                    await checkPWAStatus();
                  } catch (error) {
                    console.error('Manual SW registration failed:', error);
                    alert(`Service Worker registration failed: ${error.message}`);
                  }
                }}
                className="w-full"
              >
                Register Service Worker
              </Button>
            )}
            
            {pwaStatus.swRegistered && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                      await registration.unregister();
                    }
                    console.log('Service Worker unregistered');
                    await checkPWAStatus();
                  } catch (error) {
                    console.error('Service Worker unregistration failed:', error);
                  }
                }}
                className="w-full"
              >
                Unregister Service Worker
              </Button>
            )}
            
            {pwaStatus.swRegistered && !pwaStatus.swController && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    console.log('Forcing service worker to take control...');
                    // Force page reload to activate service worker
                    window.location.reload();
                  } catch (error) {
                    console.error('Failed to force service worker control:', error);
                  }
                }}
                className="w-full"
              >
                Force Service Worker Control
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 