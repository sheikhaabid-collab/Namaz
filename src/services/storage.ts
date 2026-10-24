/**
 * Persistent Storage Layer for QadaMate
 * Handles localStorage with schema validation, migration, referential links,
 * and reactive listener hooks.
 */

import { AppSettings, BackupData, DailyPrayerRecord, PrayerName, PRAYER_NAMES, QadaRecord } from '../types/prayer';
import { getTodayDateString, shiftDateDays } from '../utils/dateUtils';

const STORAGE_KEY_DAILY = 'qadamate_daily_prayers_v1';
const STORAGE_KEY_QADA = 'qadamate_qada_records_v1';
const STORAGE_KEY_SETTINGS = 'qadamate_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  soundEnabled: true,
  notificationsEnabled: false,
  reminderTimes: {
    Fajr: { enabled: true, time: '05:30' },
    Zuhr: { enabled: true, time: '13:00' },
    Asr: { enabled: true, time: '16:45' },
    Maghrib: { enabled: true, time: '18:30' },
    Isha: { enabled: true, time: '20:15' },
  },
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToDataChanges(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });
}

// ----------------- Daily Prayers ----------------- //

export function getDailyPrayersMap(): Record<string, DailyPrayerRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse daily prayers', e);
    return {};
  }
}

function saveDailyPrayersMap(map: Record<string, DailyPrayerRecord>): void {
  localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(map));
  notifyListeners();
}

export function getDailyPrayerRecord(dateKey: string, prayer: PrayerName): DailyPrayerRecord {
  const map = getDailyPrayersMap();
  const id = `${dateKey}_${prayer}`;
  if (map[id]) {
    return map[id];
  }
  return {
    id,
    date: dateKey,
    prayer,
    status: 'pending',
    updatedAt: Date.now(),
  };
}

export function getDailyPrayersForDate(dateKey: string): DailyPrayerRecord[] {
  const map = getDailyPrayersMap();
  return PRAYER_NAMES.map((prayer) => {
    const id = `${dateKey}_${prayer}`;
    return (
      map[id] || {
        id,
        date: dateKey,
        prayer,
        status: 'pending',
        updatedAt: 0,
      }
    );
  });
}

export function updateDailyPrayerStatus(
  dateKey: string,
  prayer: PrayerName,
  status: 'pending' | 'prayed' | 'missed',
  linkedQadaId?: string
): DailyPrayerRecord {
  const map = getDailyPrayersMap();
  const id = `${dateKey}_${prayer}`;
  const existing = map[id];

  const updated: DailyPrayerRecord = {
    id,
    date: dateKey,
    prayer,
    status,
    qadaId: linkedQadaId !== undefined ? linkedQadaId : existing?.qadaId,
    updatedAt: Date.now(),
  };

  map[id] = updated;
  saveDailyPrayersMap(map);
  return updated;
}

// ----------------- Qada Records ----------------- //

export function getQadaRecords(): QadaRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QADA);
    if (!raw) return [];
    const list: QadaRecord[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch (e) {
    console.error('Failed to parse Qada records', e);
    return [];
  }
}

function saveQadaRecords(records: QadaRecord[]): void {
  localStorage.setItem(STORAGE_KEY_QADA, JSON.stringify(records));
  notifyListeners();
}

export function findExistingQada(
  prayer: PrayerName,
  missedDate: string
): { outstanding?: QadaRecord; completed?: QadaRecord; removed?: QadaRecord } {
  const records = getQadaRecords();
  const matches = records.filter(
    (r) => r.prayer === prayer && r.missedDate === missedDate
  );

  return {
    outstanding: matches.find((r) => r.status === 'outstanding'),
    completed: matches.find((r) => r.status === 'completed'),
    removed: matches.find((r) => r.status === 'removed'),
  };
}

export function addQadaRecord(
  prayer: PrayerName,
  missedDate: string,
  notes = '',
  sourceDailyPrayerId?: string
): { success: boolean; record?: QadaRecord; error?: string } {
  const existing = findExistingQada(prayer, missedDate);

  if (existing.outstanding) {
    return {
      success: false,
      error: `An outstanding Qada for ${prayer} on ${missedDate} already exists.`,
    };
  }

  const id = 'qada_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newRecord: QadaRecord = {
    id,
    prayer,
    missedDate,
    createdAt: Date.now(),
    status: 'outstanding',
    completedAt: null,
    notes: notes.trim(),
    sourceDailyPrayerId,
  };

  const records = getQadaRecords();
  records.push(newRecord);
  saveQadaRecords(records);

  // If there's an associated daily prayer record, link it
  if (sourceDailyPrayerId) {
    const map = getDailyPrayersMap();
    if (map[sourceDailyPrayerId]) {
      map[sourceDailyPrayerId].qadaId = id;
      map[sourceDailyPrayerId].status = 'missed';
      saveDailyPrayersMap(map);
    }
  } else {
    // Also check if a daily prayer record exists for that date & prayer
    const dailyId = `${missedDate}_${prayer}`;
    const map = getDailyPrayersMap();
    if (map[dailyId]) {
      map[dailyId].qadaId = id;
      map[dailyId].status = 'missed';
      saveDailyPrayersMap(map);
    }
  }

  return { success: true, record: newRecord };
}

export function updateQadaRecord(
  id: string,
  updates: Partial<Pick<QadaRecord, 'prayer' | 'missedDate' | 'notes'>>
): boolean {
  const records = getQadaRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  records[idx] = {
    ...records[idx],
    ...updates,
  };
  saveQadaRecords(records);
  return true;
}

export function completeQadaRecord(id: string): { success: boolean; record?: QadaRecord } {
  const records = getQadaRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return { success: false };

  const record = records[idx];
  const updated: QadaRecord = {
    ...record,
    status: 'completed',
    completedAt: Date.now(),
  };

  records[idx] = updated;
  saveQadaRecords(records);
  return { success: true, record: updated };
}

export function undoCompleteQadaRecord(id: string): { success: boolean; record?: QadaRecord } {
  const records = getQadaRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return { success: false };

  const record = records[idx];
  const updated: QadaRecord = {
    ...record,
    status: 'outstanding',
    completedAt: null,
  };

  records[idx] = updated;
  saveQadaRecords(records);
  return { success: true, record: updated };
}

export function removeQadaRecord(id: string): { success: boolean; record?: QadaRecord } {
  const records = getQadaRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return { success: false };

  const record = records[idx];
  const updated: QadaRecord = {
    ...record,
    status: 'removed',
    removedAt: Date.now(),
  };

  records[idx] = updated;
  saveQadaRecords(records);

  // Unlink from daily prayer if linked
  if (record.sourceDailyPrayerId) {
    const map = getDailyPrayersMap();
    if (map[record.sourceDailyPrayerId] && map[record.sourceDailyPrayerId].qadaId === id) {
      delete map[record.sourceDailyPrayerId].qadaId;
      saveDailyPrayersMap(map);
    }
  }

  return { success: true, record: updated };
}

export function permanentlyDeleteQadaRecord(id: string): boolean {
  const records = getQadaRecords();
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) return false;
  saveQadaRecords(filtered);
  return true;
}

// ----------------- App Settings ----------------- //

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated: AppSettings = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  notifyListeners();
  return updated;
}

// ----------------- Backup, Restore & Clear ----------------- //

export function exportBackupData(): string {
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    dailyPrayers: getDailyPrayersMap(),
    qadaRecords: getQadaRecords(),
    settings: getAppSettings(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupData(
  jsonString: string,
  mode: 'replace' | 'merge' = 'replace'
): { success: boolean; error?: string; count?: { daily: number; qada: number } } {
  try {
    const parsed = JSON.parse(jsonString) as BackupData;
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format.' };
    }
    if (!parsed.dailyPrayers || !Array.isArray(parsed.qadaRecords)) {
      return { success: false, error: 'Invalid QadaMate backup file structure.' };
    }

    if (mode === 'replace') {
      localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(parsed.dailyPrayers));
      localStorage.setItem(STORAGE_KEY_QADA, JSON.stringify(parsed.qadaRecords));
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(parsed.settings));
      }
    } else {
      // Merge
      const currentDaily = getDailyPrayersMap();
      const currentQada = getQadaRecords();

      const mergedDaily = { ...currentDaily, ...parsed.dailyPrayers };
      const qadaMap = new Map<string, QadaRecord>();
      currentQada.forEach((q) => qadaMap.set(q.id, q));
      parsed.qadaRecords.forEach((q) => qadaMap.set(q.id, q));

      localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(mergedDaily));
      localStorage.setItem(STORAGE_KEY_QADA, JSON.stringify(Array.from(qadaMap.values())));
    }

    notifyListeners();
    const finalDaily = getDailyPrayersMap();
    const finalQada = getQadaRecords();

    return {
      success: true,
      count: {
        daily: Object.keys(finalDaily).length,
        qada: finalQada.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: 'Failed to read backup file: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
}

export function generateQadaCSV(): string {
  const records = getQadaRecords();
  const headers = ['Prayer', 'Missed Date', 'Status', 'Created Date', 'Completed Date', 'Notes'];
  const rows = records.map((r) => [
    r.prayer,
    r.missedDate,
    r.status,
    new Date(r.createdAt).toISOString().split('T')[0],
    r.completedAt ? new Date(r.completedAt).toISOString().split('T')[0] : '',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function clearAllApplicationData(): void {
  localStorage.removeItem(STORAGE_KEY_DAILY);
  localStorage.removeItem(STORAGE_KEY_QADA);
  // Keep settings or reset them
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  notifyListeners();
}

/**
 * Seeds sample records for immediate demo/testing.
 * Easily clearable anytime from Settings.
 */
export function loadSampleRecords(): void {
  const today = getTodayDateString();
  const yesterday = shiftDateDays(today, -1);
  const twoDaysAgo = shiftDateDays(today, -2);
  const threeDaysAgo = shiftDateDays(today, -3);

  // Sample Daily prayers for today
  const dailyMap: Record<string, DailyPrayerRecord> = {
    [`${today}_Fajr`]: {
      id: `${today}_Fajr`,
      date: today,
      prayer: 'Fajr',
      status: 'prayed',
      updatedAt: Date.now() - 3600000 * 8,
    },
    [`${today}_Zuhr`]: {
      id: `${today}_Zuhr`,
      date: today,
      prayer: 'Zuhr',
      status: 'prayed',
      updatedAt: Date.now() - 3600000 * 4,
    },
    [`${today}_Asr`]: {
      id: `${today}_Asr`,
      date: today,
      prayer: 'Asr',
      status: 'pending',
      updatedAt: Date.now(),
    },
    [`${today}_Maghrib`]: {
      id: `${today}_Maghrib`,
      date: today,
      prayer: 'Maghrib',
      status: 'pending',
      updatedAt: 0,
    },
    [`${today}_Isha`]: {
      id: `${today}_Isha`,
      date: today,
      prayer: 'Isha',
      status: 'pending',
      updatedAt: 0,
    },
    // Yesterday
    [`${yesterday}_Fajr`]: {
      id: `${yesterday}_Fajr`,
      date: yesterday,
      prayer: 'Fajr',
      status: 'missed',
      qadaId: 'qada_sample_1',
      updatedAt: Date.now() - 86400000,
    },
    [`${yesterday}_Zuhr`]: {
      id: `${yesterday}_Zuhr`,
      date: yesterday,
      prayer: 'Zuhr',
      status: 'prayed',
      updatedAt: Date.now() - 86400000,
    },
    [`${yesterday}_Asr`]: {
      id: `${yesterday}_Asr`,
      date: yesterday,
      prayer: 'Asr',
      status: 'prayed',
      updatedAt: Date.now() - 86400000,
    },
    [`${yesterday}_Maghrib`]: {
      id: `${yesterday}_Maghrib`,
      date: yesterday,
      prayer: 'Maghrib',
      status: 'prayed',
      updatedAt: Date.now() - 86400000,
    },
    [`${yesterday}_Isha`]: {
      id: `${yesterday}_Isha`,
      date: yesterday,
      prayer: 'Isha',
      status: 'prayed',
      updatedAt: Date.now() - 86400000,
    },
  };

  const sampleQada: QadaRecord[] = [
    {
      id: 'qada_sample_1',
      prayer: 'Fajr',
      missedDate: yesterday,
      createdAt: Date.now() - 86400000,
      status: 'outstanding',
      completedAt: null,
      notes: 'Overslept before dawn alarm',
      sourceDailyPrayerId: `${yesterday}_Fajr`,
    },
    {
      id: 'qada_sample_2',
      prayer: 'Zuhr',
      missedDate: twoDaysAgo,
      createdAt: Date.now() - 86400000 * 2,
      status: 'outstanding',
      completedAt: null,
      notes: 'Busy during travel transit',
    },
    {
      id: 'qada_sample_3',
      prayer: 'Asr',
      missedDate: threeDaysAgo,
      createdAt: Date.now() - 86400000 * 3,
      status: 'outstanding',
      completedAt: null,
      notes: 'Meeting ran past sunset',
    },
    {
      id: 'qada_sample_4',
      prayer: 'Fajr',
      missedDate: shiftDateDays(today, -5),
      createdAt: Date.now() - 86400000 * 5,
      status: 'completed',
      completedAt: Date.now() - 3600000 * 2,
      notes: 'Made up after Dhuha prayer',
    },
    {
      id: 'qada_sample_5',
      prayer: 'Isha',
      missedDate: shiftDateDays(today, -6),
      createdAt: Date.now() - 86400000 * 6,
      status: 'completed',
      completedAt: Date.now() - 3600000 * 12,
      notes: 'Made up with Fajr',
    },
  ];

  localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(dailyMap));
  localStorage.setItem(STORAGE_KEY_QADA, JSON.stringify(sampleQada));
  notifyListeners();
}
