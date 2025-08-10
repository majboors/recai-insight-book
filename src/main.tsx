import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Test that this file is being executed
console.log('🎯 main.tsx is being executed!');
console.log('🌐 Current URL:', window.location.href);
console.log('🔧 User Agent:', navigator.userAgent);

// Register service worker for PWA - run immediately
console.log('🚀 Starting service worker registration...');

if ('serviceWorker' in navigator) {
  console.log('✅ Service Worker is supported');
  
  // Register immediately
  navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none'
  })
  .then((registration) => {
    console.log('✅ Service Worker registered successfully:', registration);
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('Service Worker state changed:', newWorker.state);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New service worker available');
          }
        });
      }
    });

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service worker controller changed');
    });

    // Handle service worker errors
    navigator.serviceWorker.addEventListener('error', (error) => {
      console.error('❌ Service Worker error:', error);
    });

    return registration;
  })
  .catch((registrationError) => {
    console.error('❌ Service Worker registration failed:', registrationError);
  });
} else {
  console.warn('⚠️ Service Worker not supported in this browser');
}

console.log('🎬 Rendering React app...');
createRoot(document.getElementById("root")!).render(<App />);
