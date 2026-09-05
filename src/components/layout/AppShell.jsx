import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChevronUp, LogOut, User, Settings, LayoutDashboard, Menu, X, Search, Heart, GitCompare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRoleDashboardPath } from '../../routes/roleDashboardPaths';
import CompareTray from '../hospital/CompareTray';
import MEDIMESHBackground from './MEDIMESHBackground';

export default function AppShell() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-foreground font-serif">
            MEDI<span className="text-primary">MESH</span>
          </Link>
          <button 
            className="text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 transform flex-col border-r border-white/80 bg-[#FCFBF8]/88 shadow-[1px_0_18px_rgba(15,40,35,0.035)] backdrop-blur-2xl transition-transform duration-300 ease-out md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0
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

        </div>

        <div className="relative mt-auto border-t border-border/70 bg-white/35 p-4">
          {userMenuOpen && (
            <div className="absolute bottom-[calc(100%-4px)] left-4 right-4 overflow-hidden rounded-[16px] border border-white/80 bg-white/90 p-1.5 shadow-[0_18px_45px_rgba(15,40,35,0.12)] backdrop-blur-xl">
              {secondaryLinks.map((link) => (
                <Link key={link.name} to={link.href} onClick={() => { setUserMenuOpen(false); setMobileMenuOpen(false); }} className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary/5 hover:text-primary">
                  <link.icon className="h-4 w-4" /> {link.name}
                </Link>
              ))}
              <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
          <button type="button" onClick={() => setUserMenuOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-[14px] border border-transparent p-2 text-left transition hover:border-border hover:bg-white/70" aria-expanded={userMenuOpen}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0 shadow-sm">
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{role || 'Account'}</p>
            </div>
            <ChevronUp className={`h-4 w-4 text-muted-foreground transition-transform ${userMenuOpen ? '' : 'rotate-180'}`} />
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
