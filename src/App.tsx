import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BookManagement from "./pages/BookManagement";
import ReceiptScanner from "./pages/ReceiptScanner";
import Analytics from "./pages/Analytics";
import AIChat from "./pages/AIChat";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import TestApiTroubleshoot from "./pages/tests/TestApiTroubleshoot";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAProvider, usePWAContext } from "@/contexts/PWAContext";
import AppInstallPage from "./pages/AppInstall";

import { useEffect } from "react";
import { useEnsureRecaiWorkspace } from "@/hooks/useEnsureRecaiWorkspace";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showInstallPrompt, dismissPrompt, handleInstall } = usePWAContext();
  useEnsureRecaiWorkspace();

  // Register service worker in App component
  useEffect(() => {
    console.log('🎯 App component mounted');
    console.log('🌐 Current URL:', window.location.href);
    
    if ('serviceWorker' in navigator) {
      console.log('✅ Service Worker is supported in App');
      
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then((registration) => {
        console.log('✅ Service Worker registered from App:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed from App:', error);
      });
    } else {
      console.warn('⚠️ Service Worker not supported in App');
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/install" element={<AppInstallPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><AppLayout><BookManagement /></AppLayout></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><AppLayout><ReceiptScanner /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AppLayout><AIChat /></AppLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
          <Route path="/test/api-troubleshoot" element={<ProtectedRoute><AppLayout><TestApiTroubleshoot /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
      <PWAInstallPrompt 
        isOpen={showInstallPrompt}
        onClose={dismissPrompt}
        onInstall={handleInstall}
      />
      
      {/* PWA Debug Component - Remove in production */}
      
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PWAProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </PWAProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
