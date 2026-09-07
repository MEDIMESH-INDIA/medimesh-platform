import PageTransition from './PageTransition';
import { cn } from '../../utils/cn';

export default function AppPageContainer({ children, className }) {
  return (
    <PageTransition className={cn("medimesh-page relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 py-8 sm:py-9 lg:py-10", className)}>
      {children}
    </PageTransition>
  );
}
