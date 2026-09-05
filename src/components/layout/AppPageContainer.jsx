import PageTransition from './PageTransition';

export default function AppPageContainer({ children, className = "" }) {
  return (
    <PageTransition className={`relative z-10 mx-auto w-full max-w-[1320px] px-4 py-7 sm:px-6 md:py-10 lg:px-10 ${className}`}>
      {children}
    </PageTransition>
  );
}
