import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TopNavigation } from "@/components/TopNavigation";
import { OneSignalHandler } from "@/components/OneSignalHandler";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import News from "./pages/News";
import Police from "./pages/Police";
import PoliceStationDetails from "./pages/PoliceStationDetails";
import City from "./pages/City";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EmailConfirmation from "./pages/EmailConfirmation";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isVisible: sidebarVisible } = useSidebar();

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      // User is not admin
      setIsAdmin(false);
    }
  };

  return (
    <>
      <OneSignalHandler />
      <TopNavigation isAdmin={isAdmin} />
      <div className="pt-28">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/news" element={<News />} />
          <Route path="/police" element={<Police />} />
          <Route path="/police/station/:stationId" element={<PoliceStationDetails />} />
          <Route path="/city" element={<City />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
