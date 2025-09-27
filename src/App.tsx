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
import ErrorBoundary from "@/components/ErrorBoundary";
import { useCriticalPreload, useNextPagePreload } from "@/hooks/usePreload";
import Index from "./pages/Index";
import Search from "./pages/Search";
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
import LostAndFound from "./pages/LostAndFound";
import LostAndFoundView from "./pages/LostAndFoundView";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import SchoolTransport from "./pages/SchoolTransport";
import SchoolTransportRequest from "./pages/SchoolTransportRequest";
import SchoolTransportOffer from "./pages/SchoolTransportOffer";
import MySchoolTransports from "./pages/MySchoolTransports";
import TripService from "./pages/TripService";
import CreateTrip from "./pages/CreateTrip";
import MyTrips from "./pages/MyTrips";
import JoinTrip from "./pages/JoinTrip";
import CityServicesTraffic from "./pages/CityServicesTraffic";
import CityServicesCivilRegistry from "./pages/CityServicesCivilRegistry";
import CityServicesWholesaleMarket from "./pages/CityServicesWholesaleMarket";
import HealthCenters from "./pages/HealthCenters";
import BookService from "./pages/BookService";
import OTPVerification from "./pages/OTPVerification";
import Clinics from "./pages/Clinics";
import BookAppointment from "./pages/BookAppointment";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import MyAppointments from "./pages/MyAppointments";
import CityServicesCityCenter from "./pages/CityServicesCityCenter";
import CityServicesFamilyCourt from "./pages/CityServicesFamilyCourt";
import CityServicesCourts from "./pages/CityServicesCourts";
import CityServicesHotels from "./pages/CityServicesHotels";
import CityServicesGasStations from "./pages/CityServicesGasStations";
import CityServicesGasCompany from "./pages/CityServicesGasCompany";
import CityServicesElectricityCompany from "./pages/CityServicesElectricityCompany";
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
import EducationalServicesUniversities from "./pages/EducationalServicesUniversities";
import EducationalServicesEducationDepartment from "./pages/EducationalServicesEducationDepartment";
import MedicalServicesManagement from "./pages/admin/MedicalServicesManagement";
import MedicalServicesHospitals from "./pages/MedicalServicesHospitals";
import MedicalServicesClinics from "./pages/MedicalServicesClinics";
import MedicalServicesHealthUnits from "./pages/MedicalServicesHealthUnits";
import MedicalServicesMedicalCenters from "./pages/MedicalServicesMedicalCenters";
import MedicalServicesPharmacies from "./pages/MedicalServicesPharmacies";
import CityServicesManagement from "./pages/admin/CityServicesManagement";
import CityServicesNewManagement from "./pages/admin/CityServicesNewManagement";
import PharmaciesManagement from "./pages/admin/PharmaciesManagement";
import HotelsManagement from "./pages/admin/HotelsManagement";
import GasStationsManagement from "./pages/admin/GasStationsManagement";
import GasCompanyManagement from "./pages/admin/GasCompanyManagement";
import ElectricityCompanyManagement from "./pages/admin/ElectricityCompanyManagement";
import CityServices from "./pages/CityServices";
import CityServicesATMs from "./pages/CityServicesATMs";
import CityServicesBanks from "./pages/CityServicesBanks";
import CityServicesYouthClubs from "./pages/CityServicesYouthClubs";
import CityServicesChildren from "./pages/CityServicesChildren";
import CityServicesEvents from "./pages/CityServicesEvents";
import CityServicesPostOffices from "./pages/CityServicesPostOffices";
import CityServicesCraftsmen from "./pages/CityServicesCraftsmen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isVisible: sidebarVisible } = useSidebar();
  
  // Enable deep link handling
  useDeepLink();
  
  // Preload critical resources
  useCriticalPreload();
  useNextPagePreload();

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
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/news" element={<News />} />
          <Route path="/book-service" element={<BookService />} />
          <Route path="/health-centers" element={<HealthCenters />} />
          <Route path="/clinics/:centerId" element={<Clinics />} />
          <Route path="/book-appointment/:clinicId" element={<BookAppointment />} />
          <Route path="/appointment-confirmation/:appointmentId" element={<AppointmentConfirmation />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
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
          <Route path="/trip-service" element={<TripService />} />
          <Route path="/trip-service/create" element={<CreateTrip />} />
          <Route path="/trip-service/my-trips" element={<MyTrips />} />
          <Route path="/trip-service/join/:tripId" element={<JoinTrip />} />
          <Route path="/city-malls" element={<CityMalls />} />
          <Route path="/mall/:id" element={<MallDetails />} />
          <Route path="/worship-places" element={<WorshipPlaces />} />
          <Route path="/educational-services" element={<EducationalServices />} />
          <Route path="/educational-services/schools" element={<EducationalServicesSchools />} />
          <Route path="/educational-services/nurseries" element={<EducationalServicesNurseries />} />
          <Route path="/educational-services/centers" element={<EducationalServicesCenters />} />
          <Route path="/educational-services/teachers" element={<EducationalServicesTeachers />} />
          <Route path="/educational-services/universities" element={<EducationalServicesUniversities />} />
          <Route path="/educational-services/education-department" element={<EducationalServicesEducationDepartment />} />
          <Route path="/medical-services" element={<MedicalServices />} />
          <Route path="/medical-services/hospitals" element={<MedicalServicesHospitals />} />
          <Route path="/medical-services/clinics" element={<MedicalServicesClinics />} />
          <Route path="/medical-services/health-units" element={<MedicalServicesHealthUnits />} />
          <Route path="/medical-services/medical-centers" element={<MedicalServicesMedicalCenters />} />
          <Route path="/medical-services/pharmacies" element={<MedicalServicesPharmacies />} />
          <Route path="/city-services" element={<CityServices />} />
          <Route path="/city-services/atms" element={<CityServicesATMs />} />
          <Route path="/city-services/banks" element={<CityServicesBanks />} />
          <Route path="/city-services/youth-clubs" element={<CityServicesYouthClubs />} />
          <Route path="/city-services/children-services" element={<CityServicesChildren />} />
          <Route path="/city-services/events" element={<CityServicesEvents />} />
          <Route path="/city-services/post-offices" element={<CityServicesPostOffices />} />
          <Route path="/city-services/craftsmen" element={<CityServicesCraftsmen />} />
          <Route path="/city-services/traffic" element={<CityServicesTraffic />} />
          <Route path="/city-services/civil-registry" element={<CityServicesCivilRegistry />} />
          <Route path="/city-services/wholesale-market" element={<CityServicesWholesaleMarket />} />
          <Route path="/city-services/city-center" element={<CityServicesCityCenter />} />
          <Route path="/city-services/family-court" element={<CityServicesFamilyCourt />} />
          <Route path="/city-services/courts" element={<CityServicesCourts />} />
          <Route path="/city-services/hotels" element={<CityServicesHotels />} />
          <Route path="/city-services/gas-stations" element={<CityServicesGasStations />} />
          <Route path="/city-services/gas-company" element={<CityServicesGasCompany />} />
          <Route path="/city-services/electricity-company" element={<CityServicesElectricityCompany />} />
          <Route path="/business" element={<Business />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/educational-services" element={<EducationalServicesManagement />} />
          <Route path="/admin/medical-services" element={<MedicalServicesManagement />} />
          <Route path="/admin/city-services" element={<CityServicesManagement />} />
          <Route path="/admin/city-services-new" element={<CityServicesNewManagement />} />
          <Route path="/admin/pharmacies" element={<PharmaciesManagement />} />
          <Route path="/admin/hotels" element={<HotelsManagement />} />
          <Route path="/admin/gas-stations" element={<GasStationsManagement />} />
          <Route path="/admin/gas-company" element={<GasCompanyManagement />} />
          <Route path="/admin/electricity-company" element={<ElectricityCompanyManagement />} />
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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <SidebarProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <AppContent />
            </BrowserRouter>
          </SidebarProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
