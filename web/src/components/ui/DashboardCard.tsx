import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  subtitle,
  children,
  action,
  className = "",
}: Props) {
  return (
    <section
      className={`rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-[var(--card-border)] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
