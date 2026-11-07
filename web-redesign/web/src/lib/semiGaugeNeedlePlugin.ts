import type { Plugin } from "chart.js";

/** Rounded needle + hub for the semi gauge. Colors come from the theme. */
export const semiGaugeNeedlePlugin: Plugin<"doughnut"> = {
  id: "semiGaugeNeedle",
  afterDatasetDraw(chart) {
    const opts = chart.options.plugins?.semiGaugeNeedle;
    const ratio = opts?.ratio;
    if (ratio == null || Number.isNaN(ratio)) return;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const color = opts?.color ?? "#10201d";
    const ring = opts?.ring ?? "#ffffff";
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = chartArea.bottom;
    const radius = (chartArea.right - chartArea.left) / 2 - 10;
    const angle = Math.PI + ratio * Math.PI;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius - 8, 0);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = ring;
    ctx.stroke();
    ctx.restore();
  },
};
