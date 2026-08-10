import { Link } from 'react-router-dom';
import InteractiveMeshBackground from '../../components/effects/InteractiveMeshBackground';
import PageTransition from '../../components/effects/PageTransition';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <InteractiveMeshBackground />
      </div>

      {/* Left side - Visual branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 z-10">
        
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground mb-8 block">
            MEDI<span className="text-primary">MESH</span>
          </Link>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Healthcare discovery,<br/>connected.
          </h1>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed mb-12">
            Discover hospitals, doctors and healthcare services through a structured healthcare ecosystem.
          </p>
          
          <div className="relative h-64 w-full max-w-md">
            {/* Floating Card 1 */}
            <div className="absolute top-0 left-0 bg-white/80 backdrop-blur-sm border border-border p-4 rounded-xl shadow-sm w-64 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Verified Doctor</h3>
                  <p className="text-xs text-muted-foreground">Cardiology • Mumbai</p>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute top-20 right-0 bg-white/80 backdrop-blur-sm border border-border p-4 rounded-xl shadow-sm w-64 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Multi-specialty Hospital</h3>
                  <p className="text-xs text-muted-foreground">450 Beds • 24/7 Emergency</p>
                </div>
              </div>
            </div>

            {/* Floating Card 3 */}
            <div className="absolute bottom-0 left-8 bg-white/80 backdrop-blur-sm border border-border p-4 rounded-xl shadow-sm w-64 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 ease-out z-30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Secure Profile</h3>
                  <p className="text-xs text-muted-foreground">Private medical history</p>
                </div>
              </div>
            </div>
            
            {/* Connecting visual lines (Subtle) */}
            <svg className="absolute inset-0 w-full h-full -z-10 opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50,50 L 200,100 L 80,200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary animate-pulse" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-muted-foreground/60 text-sm">
          &copy; {new Date().getFullYear()} MEDIMESH INDIA. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative z-10">
        <PageTransition>
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="lg:hidden mb-12">
              <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
                MEDI<span className="text-primary">MESH</span>
              </Link>
            </div>
            
            <div>
              <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mt-8">
              {children}
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
