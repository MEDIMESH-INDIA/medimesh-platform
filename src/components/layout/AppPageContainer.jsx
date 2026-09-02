import PageTransition from './PageTransition';

export default function AppPageContainer({ children, className = "" }) {
  return (
    <PageTransition className={`w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10 ${className}`}>
      {children}
    </PageTransition>
  );
}

