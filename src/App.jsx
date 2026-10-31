import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthGateProvider } from "./contexts/AuthGateContext";
import { resetScrollLock } from "./lib/ui/scrollLock";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoadingState from "./components/common/LoadingState";

// Route Guards & Layouts (Eagerly Loaded)
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { GuestRoute } from "./routes/GuestRoute";
import PublicLayout from "./components/layout/PublicLayout";
import AppShell from "./components/layout/AppShell";
import CompareTray from "./components/hospital/CompareTray";

// Lazy-Loaded Auth Components
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));

// Lazy-Loaded Patient & Public Pages
const PatientDashboard = lazy(() => import("./pages/App/PatientDashboard"));
const PublicDiscover = lazy(() => import("./pages/PublicDiscover"));
const PatientDiscover = lazy(() => import("./pages/App/PatientDiscover"));
const PublicCareFinder = lazy(() => import("./pages/PublicCareFinder"));
const PatientCareFinder = lazy(() => import("./pages/App/PatientCareFinder"));
const PublicHospitalDetail = lazy(() => import("./pages/PublicHospitalDetail"));
const PatientHospitalDetail = lazy(() => import("./pages/App/PatientHospitalDetail"));
const PublicDoctors = lazy(() => import("./pages/PublicDoctors"));
const PatientDoctors = lazy(() => import("./pages/App/PatientDoctors"));
const PublicHomeVisits = lazy(() => import("./pages/PublicHomeVisits"));
const PatientHomeVisits = lazy(() => import("./pages/App/PatientHomeVisits"));
const PublicDoctorDetail = lazy(() => import("./pages/PublicDoctorDetail"));
const PatientDoctorDetail = lazy(() => import("./pages/App/PatientDoctorDetail"));
const PublicAbout = lazy(() => import("./pages/PublicAbout"));
const Compare = lazy(() => import("./pages/App/Compare"));
const Saved = lazy(() => import("./pages/App/Saved"));

// Lazy-Loaded Doctor Portal Pages
const DoctorDashboard = lazy(() => import("./pages/App/Doctor/Dashboard"));
const DoctorProfile = lazy(() => import("./pages/App/Doctor/Profile"));
const DoctorQualifications = lazy(() => import("./pages/App/Doctor/Qualifications"));
const DoctorSpecializations = lazy(() => import("./pages/App/Doctor/Specializations"));
const DoctorAffiliations = lazy(() => import("./pages/App/Doctor/Affiliations"));
const DoctorVerification = lazy(() => import("./pages/App/Doctor/Verification"));
const DoctorHomeVisits = lazy(() => import("./pages/App/Doctor/HomeVisits"));
const DoctorHomeVisitRequests = lazy(() => import("./pages/App/Doctor/HomeVisitRequests"));
const DoctorHomeVisitRequestDetail = lazy(() => import("./pages/App/Doctor/HomeVisitRequestDetail"));
const DoctorSettings = lazy(() => import("./pages/App/Doctor/Settings"));

// Lazy-Loaded Hospital Portal Pages
const HospitalDashboard = lazy(() => import("./pages/App/HospitalDashboard"));
const HospitalProfile = lazy(() => import("./pages/App/Hospital/Profile"));
const HospitalSpecialties = lazy(() => import("./pages/App/Hospital/Specialties"));
const HospitalFacilities = lazy(() => import("./pages/App/Hospital/Facilities"));
const HospitalServices = lazy(() => import("./pages/App/Hospital/Services"));
const HospitalDoctors = lazy(() => import("./pages/App/Hospital/Doctors"));
const HospitalVerification = lazy(() => import("./pages/App/Hospital/Verification"));
const HospitalSettings = lazy(() => import("./pages/App/Hospital/Settings"));

// Lazy-Loaded Admin & Shared Authenticated Pages
const AdminDashboard = lazy(() => import("./pages/App/AdminDashboard"));
const Profile = lazy(() => import("./pages/App/Profile"));
const Settings = lazy(() => import("./pages/App/Settings"));
const Onboarding = lazy(() => import("./pages/App/Onboarding"));
const HomeVisitBooking = lazy(() => import("./pages/App/Patient/HomeVisitBooking"));
const PatientHomeVisitBookings = lazy(() => import("./pages/App/Patient/HomeVisitBookings"));
const PatientHomeVisitBookingDetail = lazy(() => import("./pages/App/Patient/HomeVisitBookingDetail"));

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
      <Suspense fallback={<LoadingState label="Loading MEDIMESH…" className="min-h-screen" />}>
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
    </Suspense>
    <CompareTray />
    </AuthGateProvider>
  );
}

export default App;
