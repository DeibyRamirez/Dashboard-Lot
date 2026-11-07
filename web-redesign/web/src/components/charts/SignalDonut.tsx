import { useChartTheme } from "../../lib/chartTheme";
import { RingDonut } from "./RingDonut";

type Props = {
  percent: number;
  rssiDbm: number | null | undefined;
};

export function SignalDonut({ percent, rssiDbm }: Props) {
  const t = useChartTheme();
  const p = Math.min(100, Math.max(0, percent));
  const color = p >= 60 ? t.good : p >= 35 ? t.amber : t.coral;
  const label = p >= 60 ? "Señal estable" : p >= 35 ? "Señal aceptable" : "Señal débil";

  return (
    <div className="flex h-full flex-col items-center">
      <RingDonut
        percent={p}
        color={color}
        ariaLabel={`Señal ${p} por ciento, RSSI ${rssiDbm ?? "desconocido"} dBm`}
        caption={rssiDbm != null ? `${rssiDbm} dBm` : "—"}
      />
      <span className="mt-3 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink">
        {label}
      </span>
    </div>
  );
}
