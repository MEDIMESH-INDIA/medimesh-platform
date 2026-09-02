import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Settings, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { getRoleDashboardPath } from '../../routes/roleDashboardPaths';

export default function AppShell() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardPath = getRoleDashboardPath(role);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    ...(dashboardPath
      ? [{ name: 'Dashboard', href: dashboardPath, icon: LayoutDashboard }]
      : []),
    { name: 'Profile', href: '/app/profile', icon: User },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
              MEDI<span className="text-primary">MESH</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{profile?.display_name || user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role || 'Account'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors ml-4"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-foreground p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border p-4 absolute top-16 left-0 w-full z-40 shadow-xl">
          <div className="flex items-center gap-3 mb-6 p-4 bg-surface rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.display_name || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{role || 'Account'}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-surface rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-muted-foreground" />
                {link.name}
              </Link>
            ))}
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
