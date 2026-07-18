"use client";

import { SVGProps } from "react";

export const EmptySearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 120" fill="none" {...props}>
    <circle cx="90" cy="60" r="40" fill="currentColor" className="text-accent/20" />
    <path d="M115 85L140 110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-accent" />
    <circle cx="85" cy="55" r="35" fill="currentColor" className="text-accent/30" />
    <path d="M105 75L130 100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
  </svg>
);

export const EmptyHomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 160" fill="none" {...props}>
    <path d="M40 90L100 40L160 90V140H40V90Z" fill="currentColor" className="text-accent/20" />
    <path d="M40 90L100 50L160 90" stroke="currentColor" strokeWidth="4" className="text-accent" />
    <rect x="70" y="110" width="25" height="30" fill="currentColor" className="text-accent/30" />
    <rect x="105" y="100" width="25" height="40" fill="currentColor" className="text-accent/30" />
  </svg>
);

export const EmptyHeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 120" fill="none" {...props}>
    <path d="M60 105C60 105 20 70 20 45C20 25 35 15 60 35C85 15 100 25 100 45C100 70 60 105 60 105Z" fill="currentColor" className="text-accent/20" />
    <path d="M60 105C60 105 20 70 20 45C20 25 35 15 60 35C85 15 100 25 100 45C100 70 60 105 60 105Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-accent" />
  </svg>
);

export const EmptyMapIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" {...props}>
    <rect x="30" y="30" width="140" height="140" rx="20" fill="currentColor" className="text-accent/20" />
    <path d="M50 80H150M50 120H150M70 160H130" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-accent" />
    <circle cx="90" cy="60" r="10" fill="currentColor" className="text-accent" />
    <circle cx="140" cy="50" r="6" fill="currentColor" className="text-accent" />
  </svg>
);

export const EmptyDocumentIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 160 200" fill="none" {...props}>
    <path d="M30 20H130C140 20 145 25 145 35V165C145 175 140 180 130 180H30C20 180 15 175 15 165V35C15 25 20 20 30 20Z" fill="currentColor" className="text-accent/20" />
    <path d="M40 60H120M40 90H120M40 120H100M40 150H80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
  </svg>
);

export const EmptyMailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 140" fill="none" {...props}>
    <rect x="20" y="30" width="160" height="100" rx="10" fill="currentColor" className="text-accent/20" />
    <path d="M20 40L100 80L180 40" stroke="currentColor" strokeWidth="6" className="text-accent" />
    <path d="M100 80V130" stroke="currentColor" strokeWidth="4" className="text-accent" />
  </svg>
);

export const EmptySettingsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 140 140" fill="none" {...props}>
    <circle cx="70" cy="70" r="25" fill="currentColor" className="text-accent/20" />
    <path d="M70 20V10M70 120V130M20 70H10M120 70H130M30 30L22 22M108 118L116 126M30 110L22 118M108 22L116 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
    <circle cx="70" cy="70" r="15" fill="none" stroke="currentColor" strokeWidth="4" className="text-accent" />
  </svg>
);

export const EmptyUsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 120" fill="none" {...props}>
    <circle cx="60" cy="50" r="20" fill="currentColor" className="text-accent/20" />
    <circle cx="140" cy="50" r="20" fill="currentColor" className="text-accent/20" />
    <circle cx="60" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent" />
    <circle cx="140" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent" />
    <path d="M30 110C30 90 45 70 60 70C75 70 90 90 100 110" stroke="currentColor" strokeWidth="4" className="text-accent" />
    <path d="M100 110C110 90 125 70 140 70C155 70 170 90 170 110" stroke="currentColor" strokeWidth="4" className="text-accent" />
  </svg>
);

export const EmptyHouseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 160" fill="none" {...props}>
    <path d="M40 100L100 40L160 100V140H40V100Z" fill="currentColor" className="text-accent/20" />
    <path d="M40 100L100 50L160 100" stroke="currentColor" strokeWidth="4" className="text-accent" />
    <rect x="70" y="120" width="60" height="20" fill="currentColor" className="text-accent/30" />
    <rect x="80" y="80" width="40" height="20" fill="currentColor" className="text-accent/30" />
  </svg>
);

export const NoInternetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 160 160" fill="none" {...props}>
    <circle cx="80" cy="80" r="50" fill="currentColor" className="text-accent/20" />
    <path d="M50 50L110 110M110 50L50 110" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-red-500" />
    <circle cx="80" cy="80" r="35" fill="none" stroke="currentColor" strokeWidth="4" className="text-accent/30" />
  </svg>
);

export const PermissionDeniedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 160 160" fill="none" {...props}>
    <rect x="30" y="50" width="100" height="80" rx="10" fill="currentColor" className="text-accent/20" />
    <path d="M60 90H100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
    <path d="M80 50V70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
    <circle cx="80" cy="110" r="10" fill="currentColor" className="text-red-500" />
  </svg>
);

export const Error500Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 160 120" fill="none" {...props}>
    <circle cx="80" cy="60" r="40" fill="currentColor" className="text-accent/20" />
    <path d="M60 45L65 55L75 35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
    <path d="M85 65L95 75L110 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
    <path d="M60 75L65 85L75 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
    <path d="M85 45L95 55L110 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
  </svg>
);