
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TimeEntriesProvider } from "@/contexts/TimeEntriesContext";
import PrivateRoute from "@/components/PrivateRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TimeEntry from "./pages/TimeEntry";
import UserEntries from "./pages/UserEntries";
import Analysis from "./pages/Analysis";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TimeEntriesProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/time-entry" element={<TimeEntry />} />
                <Route path="/my-entries" element={<UserEntries />} />
                <Route path="/analysis" element={<Analysis />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<PrivateRoute requireAdmin={true} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TimeEntriesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
