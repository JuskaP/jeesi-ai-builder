import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AgentSettings from "./pages/AgentSettings";
import AgentDiagnostics from "./pages/AgentDiagnostics";
import TestAgent from "./pages/TestAgent";
import EmbedAgent from "./pages/EmbedAgent";
import Community from "./pages/Community";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import AcceptInvitation from "./pages/AcceptInvitation";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PublicChat from "./pages/PublicChat";
import ProtectedRoute from "./components/ProtectedRoute";
import DataConsentDialog from "./components/DataConsentDialog";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  const isPublicChatRoute = location.pathname.startsWith("/chat/");

  return (
    <>
      {!isPublicChatRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route 
          path="/agents/:id/settings" 
          element={
            <ProtectedRoute>
              <PageTransition><AgentSettings /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agents/:id/test" 
          element={
            <ProtectedRoute>
              <PageTransition><TestAgent /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agents/:id/diagnostics" 
          element={
            <ProtectedRoute>
              <PageTransition><AgentDiagnostics /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agents/:id/embed" 
          element={
            <ProtectedRoute>
              <PageTransition><EmbedAgent /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/workspaces" element={<PageTransition><Workspaces /></PageTransition>} />
        <Route 
          path="/workspaces/:id" 
          element={
            <ProtectedRoute>
              <PageTransition><WorkspaceDetail /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route path="/invite/:token" element={<PageTransition><AcceptInvitation /></PageTransition>} />
        <Route path="/billing" element={<PageTransition><Billing /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <PageTransition><Admin /></PageTransition>
            </ProtectedRoute>
          } 
        />
        {/* Public chat route for iframe embedding - no navbar/footer */}
        <Route path="/chat/:id" element={<PublicChat />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    {!isPublicChatRoute && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
        <DataConsentDialog />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
