type Props = {
  label: string;
  active: boolean;
  activeText?: string;
  inactiveText?: string;
};

export function StatusBadge({
  label,
  active,
  activeText = "Sí",
  inactiveText = "No",
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-cyan-900/60 bg-slate-900/80 px-4 py-3">
      <span className="text-sm uppercase tracking-widest text-cyan-200/70">
        {label}
      </span>
      <span
        className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${
          active
            ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40"
            : "bg-slate-700/50 text-slate-400 ring-1 ring-slate-600/40"
        }`}
      >
        {active ? activeText : inactiveText}
      </span>
    </div>
  );
}
