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
import TestApiTroubleshoot from "./pages/tests/TestApiTroubleshoot";
import NotFound from "./pages/NotFound";
import { AppLayout } from "@/components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/books" element={<AppLayout><BookManagement /></AppLayout>} />
          <Route path="/scanner" element={<AppLayout><ReceiptScanner /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><AIChat /></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
          <Route path="/test/api-troubleshoot" element={<AppLayout><TestApiTroubleshoot /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
