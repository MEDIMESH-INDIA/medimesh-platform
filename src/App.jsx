import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";

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
      <Route path="/" element={<LandingPage />} />
      <Route path="/discover" element={<PlaceholderPage title="Discover Healthcare" />} />
      <Route path="/compare" element={<PlaceholderPage title="Compare Hospitals" />} />
      <Route path="/doctors" element={<PlaceholderPage title="For Doctors" />} />
      <Route path="/hospitals" element={<PlaceholderPage title="For Hospitals" />} />
      <Route path="/about" element={<PlaceholderPage title="About MEDIMESH" />} />
      <Route path="/sign-in" element={<PlaceholderPage title="Sign In" />} />
      <Route path="/get-started" element={<PlaceholderPage title="Get Started" />} />
    </Routes>
  );
}

export default App;
