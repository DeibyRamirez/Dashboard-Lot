type Props = {
  title: string;
  value: string;
  unit: string;
  accent?: string;
};

export function MetricCard({ title, value, unit, accent = "text-cyan-300" }: Props) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-cyan-800/50 bg-gradient-to-br from-slate-950 to-slate-900 p-5 shadow-[0_0_30px_-12px_rgba(34,211,238,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.06)_0%,transparent_50%)]" />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/60">
        {title}
      </p>
      <p className={`mt-3 font-mono text-3xl font-semibold tabular-nums ${accent}`}>
        {value}
        <span className="ml-1 text-base font-normal text-slate-500">{unit}</span>
      </p>
    </article>
  );
}
