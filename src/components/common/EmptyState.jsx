import FrostedPanel from './FrostedPanel';

export default function EmptyState({ icon: Icon, eyebrow, title, description, action }) {
  return (
    <FrostedPanel className="mx-auto max-w-xl rounded-[20px] border-dashed p-6 text-center sm:p-8">
      {Icon && <span className="mx-auto grid h-11 w-11 place-items-center rounded-[18px] border border-border bg-white/70 text-primary"><Icon className="h-6 w-6" /></span>}
      {eyebrow && <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.025em]">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </FrostedPanel>
  );
}
