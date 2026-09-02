import PageTransition from './PageTransition';

export default function AppPageContainer({ children, className = "" }) {
  return (
    <PageTransition className={`w-full h-full space-y-12 pb-16 ${className}`}>
      {children}
    </PageTransition>
  );
}
