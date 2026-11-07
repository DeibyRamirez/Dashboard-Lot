import type { Plugin } from "chart.js";

export const semiGaugeNeedlePlugin: Plugin<"doughnut"> = {
  id: "semiGaugeNeedle",
  afterDatasetDraw(chart) {
    const ratio = chart.options.plugins?.semiGaugeNeedle?.ratio;
    if (ratio == null || Number.isNaN(ratio)) return;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = chartArea.bottom;
    const radius = (chartArea.right - chartArea.left) / 2 - 8;
    const angle = Math.PI + ratio * Math.PI;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius - 6, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.restore();
  },
};
