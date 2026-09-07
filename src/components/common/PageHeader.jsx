import { cn } from '../../utils/cn';
import SectionEyebrow from './SectionEyebrow';

export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cn('mb-7 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
        <h1 className="mt-2 font-serif text-[30px] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-4xl lg:text-[42px]">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
