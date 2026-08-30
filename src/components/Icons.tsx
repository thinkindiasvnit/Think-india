import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

const defaultProps = (size = 18, className = "") => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

export const IconCalendar: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const IconMapPin: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconMic: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconTag: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const IconShare: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const IconBookmark: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconBookmarkFilled: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)} fill="currentColor">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconFilter: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconEdit: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IconTrash: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconSparkles: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" />
    <path d="M20 16l1.2 2.8L24 20l-2.8 1.2L20 24l-1.2-2.8L16 20l2.8-1.2z" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconX: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconImage: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const IconInfo: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const IconAward: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export const IconFileText: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const IconBell: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconGlobe: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const IconExternalLink: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const IconShieldCheck: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const IconTicket: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z" />
    <line x1="13" y1="7" x2="13" y2="17" strokeDasharray="2 2" />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const IconUserCheck: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

export const IconLayers: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const IconLaptop: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="1" y1="20" x2="23" y2="20" />
  </svg>
);

export const IconBookOpen: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg {...defaultProps(size, className)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
