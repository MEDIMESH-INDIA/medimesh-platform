import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import InteractiveMeshBackground from '../effects/InteractiveMeshBackground';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-transparent relative flex flex-col">
      <InteractiveMeshBackground />
      <Navbar />
      <main className="flex-1 pt-24 pb-10 relative z-10">
        <Outlet />
      </main>
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
