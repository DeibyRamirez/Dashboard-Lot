type Props = {
  label: string;
  active: boolean;
  activeText?: string;
  inactiveText?: string;
};

export function StatusBadge({ label, active, activeText = "Sí", inactiveText = "No" }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          active ? "bg-brand-soft text-brand-strong" : "bg-card text-muted"
        }`}
      >
        {active ? activeText : inactiveText}
      </span>
    </div>
  );
}
