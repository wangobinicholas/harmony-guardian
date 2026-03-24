import React from 'react';

// Highly unique, stylized SVG Autism awareness ribbon logo
export const LogoIcon = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 30,80 C 10,80 10,50 30,30 C 50,10 80,10 80,30 C 80,50 30,50 30,70" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
    <path d="M 70,80 C 90,80 90,50 70,30 C 50,10 20,10 20,30 C 20,50 70,50 70,70" stroke="#3B82F6" strokeWidth="12" strokeLinecap="round" />
    <circle cx="50" cy="50" r="10" fill="#FACC15" />
    <circle cx="30" cy="30" r="6" fill="#22C55E" />
    <circle cx="70" cy="30" r="6" fill="#14B8A6" />
  </svg>
);

export const DashboardIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" fill="#3B82F6" stroke="none" />
    <rect x="14" y="3" width="7" height="5" rx="1" fill="#FACC15" stroke="none" />
    <rect x="14" y="12" width="7" height="9" rx="1" fill="#EF4444" stroke="none" />
    <rect x="3" y="16" width="7" height="5" rx="1" fill="#14B8A6" stroke="none" />
  </svg>
);

export const AnalyticsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#8B5CF6" />
  </svg>
);

export const BellIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#EAB308" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#EAB308" />
  </svg>
);

export const SettingsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" stroke="#94A3B8" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#94A3B8" />
  </svg>
);

export const EmergencyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="#FDA4AF" stroke="#E11D48" />
    <line x1="12" y1="9" x2="12" y2="13" stroke="#E11D48" />
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="#E11D48" />
  </svg>
);

export const UserProfileIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="#64748B" />
    <circle cx="12" cy="7" r="4" fill="#E2E8F0" stroke="#64748B" />
  </svg>
);

export const HeartPulseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" fill="#FECACA" stroke="#EF4444" />
    <path d="M3.5 13h6l2 5 3-10 2 5h4" stroke="#EF4444" strokeWidth="2.5" />
  </svg>
);

export const ClipboardIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#64748B" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="#64748B" />
    <path d="M9 14h6" stroke="#64748B" />
    <path d="M9 18h6" stroke="#64748B" />
    <path d="M9 10h.01" stroke="#64748B" />
  </svg>
);

// --- NEW PREMIUM ICONS ---

export const HomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#3B82F6" />
    <polyline points="9 22 9 12 15 12 15 22" stroke="#3B82F6" />
  </svg>
);

export const PhoneIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#10B981" />
  </svg>
);

export const LungsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v7" stroke="#38BDF8" />
    <path d="M12 9A5 5 0 0 0 7 14v6s-2 1-4 1c-1.66 0-3-1.34-3-3v-4c0-2.76 2.24-5 5-5h2" stroke="#38BDF8" fill="rgba(56, 189, 248, 0.2)" />
    <path d="M12 9a5 5 0 0 1 5 5v6s2 1 4 1c1.66 0 3-1.34 3-3v-4c0-2.76-2.24-5-5-5h-2" stroke="#38BDF8" fill="rgba(56, 189, 248, 0.2)" />
  </svg>
);

export const LogoutIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#94A3B8" />
    <polyline points="16 17 21 12 16 7" stroke="#94A3B8" />
    <line x1="21" y1="12" x2="9" y2="12" stroke="#94A3B8" />
  </svg>
);

export const ActivityIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#F59E0B" />
  </svg>
);

export const WifiIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="#10B981" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="#10B981" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="#10B981" />
    <line x1="12" y1="20" x2="12.01" y2="20" stroke="#10B981" strokeWidth="3" />
  </svg>
);

export const BrainIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" stroke="#8B5CF6" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" stroke="#8B5CF6" />
  </svg>
);

export const DocumentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#64748B" />
    <polyline points="14 2 14 8 20 8" stroke="#64748B" />
    <line x1="16" y1="13" x2="8" y2="13" stroke="#64748B" />
    <line x1="16" y1="17" x2="8" y2="17" stroke="#64748B" />
    <polyline points="10 9 9 9 8 9" stroke="#64748B" />
  </svg>
);

export const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" stroke="#10B981" />
  </svg>
);

export const ServerIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" stroke="#6366F1" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" stroke="#6366F1" />
    <line x1="6" y1="6" x2="6.01" y2="6" stroke="#6366F1" strokeWidth="3" />
    <line x1="6" y1="18" x2="6.01" y2="18" stroke="#6366F1" strokeWidth="3" />
  </svg>
);

export const UsersIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#3B82F6" />
    <circle cx="9" cy="7" r="4" stroke="#3B82F6" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#3B82F6" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#3B82F6" />
  </svg>
);

export const ShieldIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#8B5CF6" />
  </svg>
);

export const SmartphoneIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="#10B981" />
    <line x1="12" y1="18" x2="12.01" y2="18" stroke="#10B981" strokeWidth="3" />
  </svg>
);
