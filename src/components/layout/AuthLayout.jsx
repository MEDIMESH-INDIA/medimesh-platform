import { Link } from 'react-router-dom';
import InteractiveMeshBackground from '../../components/effects/InteractiveMeshBackground';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <InteractiveMeshBackground />
      </div>

      {/* Left side - Visual branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 z-10">
        
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground mb-8 block">
            MEDI<span className="text-primary">MESH</span>
          </Link>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Healthcare discovery,<br/>connected.
          </h1>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Discover hospitals, doctors and healthcare services through a structured healthcare ecosystem.
          </p>
        </div>

        <div className="relative z-10 text-muted-foreground/60 text-sm">
          &copy; {new Date().getFullYear()} MEDIMESH INDIA. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative z-10">
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
      </div>
    </div>
  );
}
