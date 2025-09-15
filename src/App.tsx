import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TopNavigation } from "@/components/TopNavigation";
import { OneSignalHandler } from "@/components/OneSignalHandler";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { useDeepLink } from "@/hooks/useDeepLink";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import News from "./pages/News";
import Police from "./pages/Police";
import PoliceStationDetails from "./pages/PoliceStationDetails";
import City from "./pages/City";
import Business from "./pages/Business";
import Jobs from "./pages/Jobs";
import MyJobs from "./pages/MyJobs";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EmailConfirmation from "./pages/EmailConfirmation";
import FloatingChat from "@/components/FloatingChat";
import CityServices from "./pages/CityServices";
import LostAndFound from "./pages/LostAndFound";
import LostAndFoundView from "./pages/LostAndFoundView";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import SchoolTransport from "./pages/SchoolTransport";
import SchoolTransportRequest from "./pages/SchoolTransportRequest";
import SchoolTransportOffer from "./pages/SchoolTransportOffer";
import MySchoolTransports from "./pages/MySchoolTransports";
import RealEstate from "./pages/RealEstate";
import RealEstateDetails from "./pages/RealEstateDetails";
import EducationalServices from "./pages/EducationalServices";
import MedicalServices from "./pages/MedicalServices";
import MallDetails from "./pages/MallDetails";
import CityMalls from "./pages/CityMalls";
import WorshipPlaces from "./pages/WorshipPlaces";
import EducationalServicesManagement from "./pages/admin/EducationalServicesManagement";
import EducationalServicesSchools from "./pages/EducationalServicesSchools";
import EducationalServicesNurseries from "./pages/EducationalServicesNurseries";
import EducationalServicesCenters from "./pages/EducationalServicesCenters";
import EducationalServicesTeachers from "./pages/EducationalServicesTeachers";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isVisible: sidebarVisible } = useSidebar();
  
  // Enable deep link handling
  useDeepLink();

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
          <Route path="/city-services" element={<CityServices />} />
          <Route path="/services/lost-and-found" element={<LostAndFound />} />
          <Route path="/services/lost-and-found/view-all" element={<LostAndFoundView />} />
          <Route path="/services/lost-and-found/report-lost" element={<ReportLost />} />
          <Route path="/services/lost-and-found/report-found" element={<ReportFound />} />
          <Route path="/services/school-transport" element={<SchoolTransport />} />
          <Route path="/services/school-transport/request" element={<SchoolTransportRequest />} />
          <Route path="/services/school-transport/offer" element={<SchoolTransportOffer />} />
          <Route path="/services/school-transport/my-transports" element={<MySchoolTransports />} />
          <Route path="/real-estate" element={<RealEstate />} />
          <Route path="/real-estate/:id" element={<RealEstateDetails />} />
          <Route path="/city-malls" element={<CityMalls />} />
          <Route path="/mall/:id" element={<MallDetails />} />
          <Route path="/worship-places" element={<WorshipPlaces />} />
          <Route path="/educational-services" element={<EducationalServices />} />
          <Route path="/educational-services/schools" element={<EducationalServicesSchools />} />
          <Route path="/educational-services/nurseries" element={<EducationalServicesNurseries />} />
          <Route path="/educational-services/centers" element={<EducationalServicesCenters />} />
          <Route path="/educational-services/teachers" element={<EducationalServicesTeachers />} />
          <Route path="/medical-services" element={<MedicalServices />} />
          <Route path="/business" element={<Business />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/educational-services" element={<EducationalServicesManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <FloatingChat />
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
