import "chart.js";

declare module "chart.js" {
  interface PluginOptionsByType<TType extends ChartType = ChartType> {
    semiGaugeNeedle?: { ratio?: number; color?: string; ring?: string };
  }
}
