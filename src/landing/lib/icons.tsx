'use client';
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => {
  const { size = 20, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
};

/** TripSplit logo — location pin that splits into two travel paths */
export function Logo({ size = 30, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <path
        d="M16 2.6C10 2.6 5.2 7.4 5.2 13.4c0 7.8 10.8 16 10.8 16s10.8-8.2 10.8-16C26.8 7.4 22 2.6 16 2.6z"
        fill="#FF5A36"
      />
      <path
        d="M11.6 10.6h8.8M16 10.6v4.2m0 0l-3.6 3.8m3.6-3.8l3.6 3.8"
        stroke="#FCF8EE"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);
export const IconRoute = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="19" r="2.4" />
    <circle cx="18" cy="5" r="2.4" />
    <path d="M8.2 17.6C11.5 16 9 10.5 12.5 9c2.2-1 3.4.4 5-2.2" strokeDasharray="3.4 3" />
  </svg>
);
export const IconSplit = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v6m0 0c0 3-6 3.4-6 7.5V19m6-10c0 3 6 3.4 6 7.5V19" />
    <path d="M4 19h4m8 0h4" />
  </svg>
);
export const IconWallet = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h11.5A2 2 0 0 1 19.5 7v.5" />
    <rect x="3.5" y="7.5" width="17" height="12" rx="2.4" />
    <circle cx="16.4" cy="13.5" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2" />
    <path d="M15.5 5.9a3.2 3.2 0 0 1 0 5.2M17.6 14.6c1.7.8 2.7 2.5 3 4.9" />
  </svg>
);
export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4v15.5h16" />
    <path d="M8.5 15.5V11m4.5 4.5V7.5m4.5 8v-3" />
  </svg>
);
export const IconTrophy = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 4h8v6a4 4 0 0 1-8 0V4z" />
    <path d="M8 5.5H4.5v1A3.5 3.5 0 0 0 8 10M16 5.5h3.5v1A3.5 3.5 0 0 1 16 10" />
    <path d="M12 14v3.5m-3.5 3h7m-6-3h5l.8 3H8.2l.8-3z" />
  </svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4a5.5 5.5 0 0 0-5.5 5.5c0 4.6-1.6 5.6-1.6 5.6h14.2s-1.6-1-1.6-5.6A5.5 5.5 0 0 0 12 4z" />
    <path d="M10 18.5a2.1 2.1 0 0 0 4 0" />
  </svg>
);
export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 5 6v5.2c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V6l-7-2.5z" />
    <path d="m9.2 11.8 2 2 3.6-4" />
  </svg>
);
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2.2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
export const IconUserCtl = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c.8-3.8 3.4-5.8 7-5.8s6.2 2 7 5.8" />
    <path d="M17.5 3.5 19 5l2.5-2.5" />
  </svg>
);
export const IconDevice = (p: P) => (
  <svg {...base(p)}>
    <rect x="7.5" y="3" width="9" height="18" rx="2.4" />
    <path d="M10.8 17.8h2.4" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);
export const IconCross = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15m-6-6 6 6-6 6" />
  </svg>
);
export const IconCamera = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 8.5h3l1.5-2.5h6L16.5 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-8a1.5 1.5 0 0 1 1.5-1.5z" />
    <circle cx="12" cy="13.5" r="3.4" />
  </svg>
);
export const IconMap = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 4.5-5 2v13l5-2 6 2 5-2v-13l-5 2-6-2z" />
    <path d="M9 4.5v13m6-11v13" />
  </svg>
);
export const IconTicket = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 2v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-2V8z" />
    <path d="M14 6v2.2m0 3v1.6m0 3V18" strokeDasharray="0.2 3.2" />
  </svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="5.5" width="16" height="15" rx="2.4" />
    <path d="M4 10h16M8.5 3.5v3.5m7-3.5v3.5" />
  </svg>
);
export const IconCompass = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2z" />
  </svg>
);
export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h12V20l-2.4-1.6L13.2 20l-2.4-1.6L8.4 20 6 18.4V3.5z" />
    <path d="M9 8h6m-6 3.5h6m-6 3.5h3.5" />
  </svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v10m0 0 4-4m-4 4-4-4" />
    <path d="M4.5 19.5h15" />
  </svg>
);
export const IconLink = (p: P) => (
  <svg {...base(p)}>
    <path d="M10 14a4.5 4.5 0 0 0 6.8.5l2.4-2.4a4.5 4.5 0 0 0-6.4-6.4L11.5 7" />
    <path d="M14 10a4.5 4.5 0 0 0-6.8-.5l-2.4 2.4a4.5 4.5 0 0 0 6.4 6.4L12.5 17" />
  </svg>
);
export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.8 10 20.5 12 13.8 14 12 20.5 10.2 14 3.5 12 10.2 10 12 3.5z" />
  </svg>
);
export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l11-6.5-11-6.5z" />
  </svg>
);
export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconPlane = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.5 13.5 3 11l1.8-1.8 5.7.8 4.6-4.6a1.6 1.6 0 0 1 2.3 2.3l-4.6 4.6.8 5.7L11.8 20l-2.5-7.5z" />
    <path d="m6 18 2.5-2.5" />
  </svg>
);
export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const IconXSocial = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 4 16 16M20 4 4 20" />
  </svg>
);
export const IconLinkedIn = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M7.6 10.5v6m0-9v.1M11.5 16.5v-6m0 2.2c0-1.5 1.1-2.4 2.4-2.4s2.4 1 2.4 2.6v3.6" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const IconMedal = (p: P & { tone?: string }) => {
  const { tone = "#FFB350", ...rest } = p;
  return (
    <svg {...base(rest)}>
      <circle cx="12" cy="9" r="5.2" fill={tone} stroke="none" opacity="0.9" />
      <path d="m9.2 13.5-1.7 7L12 18l4.5 2.5-1.7-7" />
      <path d="m12 6.4.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.5l2-.3.9-1.8z" fill="#0c1420" stroke="none" opacity="0.75" />
    </svg>
  );
};
