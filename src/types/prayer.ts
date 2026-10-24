export type PrayerName = 'Fajr' | 'Zuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];

export const PRAYER_DETAILS: Record<PrayerName, {
  arabic: string;
  transliteration: string;
  timeOfDay: string;
  rakats: string;
  description: string;
}> = {
  Fajr: {
    arabic: 'الفجر',
    transliteration: 'Al-Fajr',
    timeOfDay: 'Dawn',
    rakats: '2 Fard',
    description: 'The dawn prayer performed before sunrise'
  },
  Zuhr: {
    arabic: 'الظهر',
    transliteration: 'Al-Zuhr',
    timeOfDay: 'Midday',
    rakats: '4 Fard',
    description: 'The noon prayer after the sun passes its zenith'
  },
  Asr: {
    arabic: 'العصر',
    transliteration: 'Al-Asr',
    timeOfDay: 'Afternoon',
    rakats: '4 Fard',
    description: 'The late afternoon prayer'
  },
  Maghrib: {
    arabic: 'المغرب',
    transliteration: 'Al-Maghrib',
    timeOfDay: 'Sunset',
    rakats: '3 Fard',
    description: 'The evening prayer performed just after sunset'
  },
  Isha: {
    arabic: 'العشاء',
    transliteration: 'Al-Isha',
    timeOfDay: 'Night',
    rakats: '4 Fard',
    description: 'The night prayer performed in darkness'
  }
};

export type PrayerStatus = 'pending' | 'prayed' | 'missed';

export interface DailyPrayerRecord {
  id: string; // e.g. "2026-10-24_Fajr"
  date: string; // YYYY-MM-DD
  prayer: PrayerName;
  status: PrayerStatus;
  qadaId?: string; // Linked Qada record ID if added to Qada
  updatedAt: number;
}

export type QadaStatus = 'outstanding' | 'completed' | 'removed';

export interface QadaRecord {
  id: string;
  prayer: PrayerName;
  missedDate: string; // YYYY-MM-DD
  createdAt: number;
  status: QadaStatus;
  completedAt: number | null;
  removedAt?: number | null;
  notes: string;
  sourceDailyPrayerId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  reminderTimes: Record<PrayerName, {
    enabled: boolean;
    time: string; // HH:mm
  }>;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  dailyPrayers: Record<string, DailyPrayerRecord>;
  qadaRecords: QadaRecord[];
  settings: AppSettings;
}
