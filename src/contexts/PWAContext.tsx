import { createContext, useContext, ReactNode } from "react";
import { usePWA } from "@/hooks/usePWA";

export interface PWAContextValue {
  showInstallPrompt: boolean;
  isPWAInstalled: boolean;
  hasInstallPrompt: boolean;
  dismissPrompt: () => void;
  handleInstall: () => void;
  openPrompt: () => void;
}

const PWAContext = createContext<PWAContextValue | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  // Use a single global instance, allow usage without auth so public pages can open the prompt
  const {
    showInstallPrompt,
    isPWAInstalled,
    hasInstallPrompt,
    dismissPrompt,
    handleInstall,
    openPrompt,
  } = usePWA({ requireAuth: false });

  const value: PWAContextValue = {
    showInstallPrompt,
    isPWAInstalled,
    hasInstallPrompt,
    dismissPrompt,
    handleInstall,
    openPrompt,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

export function usePWAContext() {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error("usePWAContext must be used within a PWAProvider");
  return ctx;
}
