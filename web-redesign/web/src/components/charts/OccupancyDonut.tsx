import { useChartTheme } from "../../lib/chartTheme";
import { RingDonut } from "./RingDonut";

type Props = {
  percentOccupied: number;
  currentlyOccupied: boolean;
};

export function OccupancyDonut({ percentOccupied, currentlyOccupied }: Props) {
  const t = useChartTheme();
  const p = Math.min(100, Math.max(0, percentOccupied));

  return (
    <div className="flex h-full flex-col items-center">
      <RingDonut
        percent={p}
        color={t.brand}
        ariaLabel={`Ocupación ${p} por ciento de muestras; ahora ${currentlyOccupied ? "ocupada" : "libre"}`}
        caption="de la sesión"
      />
      <span
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          currentlyOccupied ? "bg-brand-soft text-brand-strong" : "bg-surface text-ink"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${currentlyOccupied ? "bg-brand" : "bg-muted"}`}
          aria-hidden
        />
        {currentlyOccupied ? "Ocupada ahora" : "Libre ahora"}
      </span>
    </div>
  );
}
