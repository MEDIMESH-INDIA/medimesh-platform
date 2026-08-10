import { Routes, Route } from "react-router-dom";
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

// App Layout & Pages
import AppShell from "./components/layout/AppShell";
import PatientDashboard from "./pages/App/PatientDashboard";
import DoctorDashboard from "./pages/App/DoctorDashboard";
import HospitalDashboard from "./pages/App/HospitalDashboard";
import AdminDashboard from "./pages/App/AdminDashboard";
import Profile from "./pages/App/Profile";
import Settings from "./pages/App/Settings";

// Placeholder components for new routes
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="text-center">
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">{title}</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
      <a href="/" className="mt-8 inline-block text-sm font-semibold text-primary hover:underline">
        &larr; Back to Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public/Landing Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/discover" element={<PlaceholderPage title="Discover Healthcare" />} />
      <Route path="/compare" element={<PlaceholderPage title="Compare Hospitals" />} />
      <Route path="/doctors" element={<PlaceholderPage title="For Doctors" />} />
      <Route path="/hospitals" element={<PlaceholderPage title="For Hospitals" />} />
      <Route path="/about" element={<PlaceholderPage title="About MEDIMESH" />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        {/* Patient Routes */}
        <Route path="/app" element={
          <RoleRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </RoleRoute>
        } />
        
        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </RoleRoute>
        } />
        
        {/* Hospital Routes */}
        <Route path="/hospital" element={
          <RoleRoute allowedRoles={['hospital']}>
            <HospitalDashboard />
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
  );
}

export default App;
