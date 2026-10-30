import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthGateProvider } from "./contexts/AuthGateContext";
import { resetScrollLock } from "./lib/ui/scrollLock";
import LandingPage from "./pages/LandingPage/LandingPage";

// Auth Components
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// Route Guards
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { GuestRoute } from "./routes/GuestRoute";

// App Layout & Pages
import PublicLayout from "./components/layout/PublicLayout";
import AppShell from "./components/layout/AppShell";
import PatientDashboard from "./pages/App/PatientDashboard";
import PublicDiscover from "./pages/PublicDiscover";
import PatientDiscover from "./pages/App/PatientDiscover";
import PublicCareFinder from "./pages/PublicCareFinder";
import PatientCareFinder from "./pages/App/PatientCareFinder";
import PublicHospitalDetail from "./pages/PublicHospitalDetail";
import PatientHospitalDetail from "./pages/App/PatientHospitalDetail";
import PublicDoctors from "./pages/PublicDoctors";
import PatientDoctors from "./pages/App/PatientDoctors";
import PublicHomeVisits from "./pages/PublicHomeVisits";
import PatientHomeVisits from "./pages/App/PatientHomeVisits";
import PublicDoctorDetail from "./pages/PublicDoctorDetail";
import PatientDoctorDetail from "./pages/App/PatientDoctorDetail";
import PublicAbout from "./pages/PublicAbout";
import Compare from "./pages/App/Compare";
import Saved from "./pages/App/Saved";
import DoctorDashboard from "./pages/App/Doctor/Dashboard";
import DoctorProfile from "./pages/App/Doctor/Profile";
import DoctorQualifications from "./pages/App/Doctor/Qualifications";
import DoctorSpecializations from "./pages/App/Doctor/Specializations";
import DoctorAffiliations from "./pages/App/Doctor/Affiliations";
import DoctorVerification from "./pages/App/Doctor/Verification";
import DoctorHomeVisits from "./pages/App/Doctor/HomeVisits";
import DoctorHomeVisitRequests from "./pages/App/Doctor/HomeVisitRequests";
import DoctorHomeVisitRequestDetail from "./pages/App/Doctor/HomeVisitRequestDetail";
import DoctorSettings from "./pages/App/Doctor/Settings";
import HospitalDashboard from "./pages/App/HospitalDashboard";
import HospitalProfile from "./pages/App/Hospital/Profile";
import HospitalSpecialties from "./pages/App/Hospital/Specialties";
import HospitalFacilities from "./pages/App/Hospital/Facilities";
import HospitalServices from "./pages/App/Hospital/Services";
import HospitalDoctors from "./pages/App/Hospital/Doctors";
import HospitalVerification from "./pages/App/Hospital/Verification";
import HospitalSettings from "./pages/App/Hospital/Settings";
import AdminDashboard from "./pages/App/AdminDashboard";
import Profile from "./pages/App/Profile";
import Settings from "./pages/App/Settings";
import Onboarding from "./pages/App/Onboarding";
import HomeVisitBooking from "./pages/App/Patient/HomeVisitBooking";
import PatientHomeVisitBookings from "./pages/App/Patient/HomeVisitBookings";
import PatientHomeVisitBookingDetail from "./pages/App/Patient/HomeVisitBookingDetail";
import CompareTray from "./components/hospital/CompareTray";

function RouteScrollReset() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    resetScrollLock();

    // Preserve intentional hash/anchor navigation if present
    if (location.hash) {
      const targetId = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (targetId) {
        const scrollToTarget = () => {
          const el = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            return true;
          }
          return false;
        };

        if (!scrollToTarget()) {
          const timer = setTimeout(scrollToTarget, 50);
          return () => clearTimeout(timer);
        }
        return;
      }
    }

    // Standard navigation without hash: reset scroll to top across document and window
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [location.pathname, location.hash]);

  return null;
}

function App() {
  return (
    <AuthGateProvider>
      <RouteScrollReset />
      <Routes>
      {/* Public/Landing Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<PublicDiscover />} />
        <Route path="/care-finder" element={<PublicCareFinder />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/doctors" element={<PublicDoctors />} />
        <Route path="/home-visits" element={<PublicHomeVisits />} />
        <Route path="/doctors/:slug" element={<PublicDoctorDetail />} />
        <Route path="/for-doctors" element={<Navigate to="/register" replace />} />
        <Route path="/for-hospitals" element={<Navigate to="/register" replace />} />
        <Route path="/hospitals" element={<Navigate to="/discover" replace />} />
        <Route path="/hospitals/:slug" element={<PublicHospitalDetail />} />
        <Route path="/about" element={<PublicAbout />} />
      </Route>
      
      {/* Auth Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Onboarding Route (No AppShell) */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        {/* Patient Routes */}
        <Route path="/app" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </RoleRoute>
        } />
        <Route path="/app/discover" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientDiscover />
          </RoleRoute>
        } />
        <Route path="/app/care-finder" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientCareFinder />
          </RoleRoute>
        } />
        <Route path="/app/hospitals/:slug" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientHospitalDetail />
          </RoleRoute>
        } />
        <Route path="/app/compare" element={
          <RoleRoute allowedRoles={['patient']}>
            <Compare />
          </RoleRoute>
        } />
        <Route path="/app/saved" element={
          <RoleRoute allowedRoles={['patient']}>
            <Saved />
          </RoleRoute>
        } />
        <Route path="/app/doctors" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientDoctors />
          </RoleRoute>
        } />
        <Route path="/app/home-visits" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientHomeVisits />
          </RoleRoute>
        } />
        <Route path="/app/doctors/:slug" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientDoctorDetail />
          </RoleRoute>
        } />
        <Route path="/app/doctors/:slug/book-home-visit" element={
          <RoleRoute allowedRoles={['patient']}>
            <HomeVisitBooking />
          </RoleRoute>
        } />
        <Route path="/app/home-visit-bookings" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientHomeVisitBookings />
          </RoleRoute>
        } />
        <Route path="/app/home-visit-bookings/:id" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientHomeVisitBookingDetail />
          </RoleRoute>
        } />
        
        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </RoleRoute>
        } />
        <Route path="/doctor/profile" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorProfile />
          </RoleRoute>
        } />
        <Route path="/doctor/qualifications" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorQualifications />
          </RoleRoute>
        } />
        <Route path="/doctor/specializations" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorSpecializations />
          </RoleRoute>
        } />
        <Route path="/doctor/affiliations" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorAffiliations />
          </RoleRoute>
        } />
        <Route path="/doctor/verification" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorVerification />
          </RoleRoute>
        } />
        <Route path="/doctor/home-visits" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorHomeVisits />
          </RoleRoute>
        } />
        <Route path="/doctor/home-visit-requests" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorHomeVisitRequests />
          </RoleRoute>
        } />
        <Route path="/doctor/home-visit-requests/:id" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorHomeVisitRequestDetail />
          </RoleRoute>
        } />
        <Route path="/doctor/settings" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorSettings />
          </RoleRoute>
        } />
        
        {/* Hospital Routes */}
        <Route path="/hospital" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalDashboard />
          </RoleRoute>
        } />
        <Route path="/hospital/profile" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalProfile />
          </RoleRoute>
        } />
        <Route path="/hospital/specialties" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalSpecialties />
          </RoleRoute>
        } />
        <Route path="/hospital/facilities" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalFacilities />
          </RoleRoute>
        } />
        <Route path="/hospital/services" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalServices />
          </RoleRoute>
        } />
        <Route path="/hospital/doctors" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalDoctors />
          </RoleRoute>
        } />
        <Route path="/hospital/verification" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalVerification />
          </RoleRoute>
        } />
        <Route path="/hospital/settings" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalSettings />
          </RoleRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        } />
        
        {/* Common Authenticated Routes */}
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/settings" element={<Settings />} />
      </Route>
    </Routes>
    <CompareTray />
    </AuthGateProvider>
  );
}

export default App;
