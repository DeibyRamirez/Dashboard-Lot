// Minimal inline stroke icons (no extra dependency).
type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};
export const IconThermo = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M14 14.76V4.5a2 2 0 1 0-4 0v10.26a4 4 0 1 0 4 0Z" /><path d="M12 9v7" /></svg>
);
export const IconDrop = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3Z" /></svg>
);
export const IconWifi = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M5 12.5a10 10 0 0 1 14 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><path d="M2 9a14 14 0 0 1 20 0" /><circle cx="12" cy="19.5" r="1" /></svg>
);
export const IconUsers = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.2A6.5 6.5 0 0 1 21.5 20" /></svg>
);
export const IconGrid = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></svg>
);
export const IconFan = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="2" /><path d="M12 10c0-4 1-7 4-7s3 4-2 7" /><path d="M14 12c4 0 7 1 7 4s-4 3-7-2" /><path d="M12 14c0 4-1 7-4 7s-3-4 2-7" /><path d="M10 12c-4 0-7-1-7-4s4-3 7 2" /></svg>
);
export const IconChart = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></svg>
);
export const IconSun = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const IconMoon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
);
export const IconPlug = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M9 2v5M15 2v5" /><path d="M6 7h12v4a6 6 0 0 1-12 0V7Z" /><path d="M12 17v5" /></svg>
);
export const IconHome = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>
);
export const IconRadio = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="2" /><path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2" /></svg>
);
export const IconSettings = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 13.6H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9.4A1.7 1.7 0 0 0 10.4 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
);
