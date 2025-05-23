
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Configure from "./pages/Configure";
import History from "./pages/History";
import HistoryDetail from "./pages/HistoryDetail";
import Configs from "./pages/Configs";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner position="top-right" />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/configure" element={<Configure />} />
                <Route path="/history" element={<History />} />
                <Route path="/history/:id" element={<HistoryDetail />} />
                <Route path="/configs" element={<Configs />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
