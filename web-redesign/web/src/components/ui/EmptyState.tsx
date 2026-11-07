import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  text: ReactNode;
  children?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ icon, title, text, children, compact = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? "py-8" : "rounded-3xl border border-dashed border-line bg-card px-6 py-12 shadow-soft sm:py-16"
      }`}
      data-reveal={compact ? undefined : true}
    >
      <span className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{text}</p>
      {children}
    </div>
  );
}
