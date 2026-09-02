import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Settings, LayoutDashboard, Menu, X, Search, Heart, GitCompare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRoleDashboardPath } from '../../routes/roleDashboardPaths';
import CompareTray from '../hospital/CompareTray';
import MEDIMESHBackground from './MEDIMESHBackground';

export default function AppShell() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('compareList') || '[]').length;
    } catch {
      return 0;
    }
  });

  const dashboardPath = getRoleDashboardPath(role);

  useEffect(() => {
    const update = () => {
      try {
        setCompareCount(JSON.parse(localStorage.getItem('compareList') || '[]').length);
      } catch {
        setCompareCount(0);
      }
    };
    window.addEventListener('compare-updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('compare-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const hasCompareTray = compareCount > 0 && location.pathname !== '/app/compare';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    ...(dashboardPath
      ? [{ name: 'Dashboard', href: dashboardPath, icon: LayoutDashboard }]
      : []),
  ];

  if (role === 'patient') {
    navLinks.push(
      { name: 'Discover', href: '/app/discover', icon: Search },
      { name: 'Compare', href: '/app/compare', icon: GitCompare },
      { name: 'Saved', href: '/app/saved', icon: Heart }
    );
  }

  const secondaryLinks = [
    { name: 'Profile', href: '/app/profile', icon: User },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row relative z-0">
      <MEDIMESHBackground />
      <header className="md:hidden bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-30">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-foreground font-serif">
            MEDI<span className="text-primary">MESH</span>
          </Link>
          <button 
            className="text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#FCFBF8]/95 backdrop-blur-xl border-r border-border/80 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-30 shrink-0 flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 md:h-20 mt-2">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground font-serif">
            MEDI<span className="text-primary">MESH</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-6">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/10 shadow-sm' 
                      : 'text-muted-foreground hover:bg-white hover:text-foreground border border-transparent hover:border-border/50 hover:shadow-sm'}
                  `}
                >
                  <link.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="h-px bg-border/60 my-2 mx-2"></div>

          <nav className="space-y-1">
            {secondaryLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/10 shadow-sm' 
                      : 'text-muted-foreground hover:bg-white hover:text-foreground border border-transparent hover:border-border/50 hover:shadow-sm'}
                  `}
                >
                  <link.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border/80 mt-auto bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0 shadow-sm">
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{role || 'Account'}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50/80 hover:border-red-100 border border-transparent rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 min-h-screen flex flex-col bg-transparent relative z-10 ${hasCompareTray ? 'pb-28 md:pb-36' : 'pb-8'}`}>
        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
        <Outlet />
      </main>
      <CompareTray />
    </div>
  );
}

