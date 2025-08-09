import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TestHealth from "./pages/tests/TestHealth";
import TestInstances from "./pages/tests/TestInstances";
import TestCategories from "./pages/tests/TestCategories";
import TestReceipts from "./pages/tests/TestReceipts";
import TestTransBudgets from "./pages/tests/TestTransBudgets";
import TestReports from "./pages/tests/TestReportsGraphsExport";
import TestInsights from "./pages/tests/TestInsightsAdvice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/test/health" element={<TestHealth />} />
          <Route path="/test/instances" element={<TestInstances />} />
          <Route path="/test/categories" element={<TestCategories />} />
          <Route path="/test/receipts" element={<TestReceipts />} />
          <Route path="/test/transactions-budgets" element={<TestTransBudgets />} />
          <Route path="/test/reports-graphs-export" element={<TestReports />} />
          <Route path="/test/insights-advice" element={<TestInsights />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
