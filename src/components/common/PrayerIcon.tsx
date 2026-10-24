import React from 'react';
import { PrayerName } from '../../types/prayer';

interface PrayerIconProps {
  prayer: PrayerName;
  className?: string;
  size?: number;
}

export const PrayerIcon: React.FC<PrayerIconProps> = ({ prayer, className = 'w-6 h-6', size = 24 }) => {
  switch (prayer) {
    case 'Fajr':
      // Dawn: rising sun with gentle rays and soft horizon
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2v3" stroke="currentColor" />
          <path d="M4.93 4.93l2.12 2.12" stroke="currentColor" />
          <path d="M19.07 4.93l-2.12 2.12" stroke="currentColor" />
          <path d="M2 18h20" stroke="currentColor" strokeWidth="2.5" />
          <path d="M6 18a6 6 0 0 1 12 0" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <circle cx="12" cy="18" r="3" fill="currentColor" />
        </svg>
      );

    case 'Zuhr':
      // Midday sun in its zenith
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
          <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
          <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
        </svg>
      );

    case 'Asr':
      // Afternoon sun rays casting shadows
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 9a4 4 0 1 0 4 4" stroke="currentColor" />
          <circle cx="14" cy="11" r="3.5" fill="currentColor" fillOpacity="0.2" />
          <line x1="2" y1="20" x2="22" y2="20" strokeWidth="2.5" />
          <line x1="6" y1="7" x2="16" y2="17" stroke="currentColor" strokeDasharray="2 2" />
          <path d="M17 5l4 4" />
          <path d="M21 5l-4 4" />
        </svg>
      );

    case 'Maghrib':
      // Sunset: setting sun dipping into the horizon
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <line x1="2" y1="18" x2="22" y2="18" strokeWidth="2.5" />
          <path d="M7 18a5 5 0 0 1 10 0" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <polyline points="9 11 12 8 15 11" />
          <path d="M5.5 13.5l1.5-1.5" />
          <path d="M18.5 13.5l-1.5-1.5" />
        </svg>
      );

    case 'Isha':
      // Night: crescent moon and shining star
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
          />
          <polygon
            points="17.5 4 18.5 6.5 21 6.5 19 8 19.8 10.5 17.5 9 15.2 10.5 16 8 14 6.5 16.5 6.5"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    default:
      return null;
  }
};
