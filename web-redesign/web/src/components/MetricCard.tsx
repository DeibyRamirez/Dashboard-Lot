type Props = {
  title: string;
  value: string;
  unit: string;
  accent?: string;
};

export function MetricCard({ title, value, unit, accent = "text-brand-strong" }: Props) {
  return (
    <article className="rounded-3xl border border-line bg-card p-5 shadow-soft">
      <p className="text-xs font-medium text-muted">{title}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${accent}`}>
        {value}
        <span className="ml-1 text-base font-medium text-muted">{unit}</span>
      </p>
    </article>
  );
}
