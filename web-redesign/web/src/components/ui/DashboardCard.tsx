import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function DashboardCard({ title, subtitle, children, action, icon, className = "" }: Props) {
  return (
    <section
      data-reveal
      className={`group rounded-3xl border border-line bg-card p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-6 ${className}`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong"
              aria-hidden
            >
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-[15px] font-semibold leading-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
