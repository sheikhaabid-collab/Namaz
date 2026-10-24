import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppSettings,
  DailyPrayerRecord,
  PrayerName,
  PRAYER_NAMES,
  QadaRecord,
} from '../types/prayer';
import {
  addQadaRecord,
  clearAllApplicationData,
  completeQadaRecord,
  getAppSettings,
  getDailyPrayersMap,
  getQadaRecords,
  loadSampleRecords,
  permanentlyDeleteQadaRecord,
  removeQadaRecord,
  saveAppSettings,
  subscribeToDataChanges,
  undoCompleteQadaRecord,
  updateDailyPrayerStatus,
  updateQadaRecord,
} from '../services/storage';
import { playGentleChime, playSuccessChime } from '../services/audio';

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoLabel?: string;
  onUndo?: () => void;
}

interface PrayerContextType {
  dailyPrayers: Record<string, DailyPrayerRecord>;
  qadaRecords: QadaRecord[];
  settings: AppSettings;
  activeTab: 'home' | 'calendar' | 'qada' | 'history' | 'settings';
  setActiveTab: (tab: 'home' | 'calendar' | 'qada' | 'history' | 'settings') => void;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  toast: ToastInfo | null;
  showToast: (info: Omit<ToastInfo, 'id'>) => void;
  dismissToast: () => void;
  
  // Computed stats
  totalOutstanding: number;
  totalCompleted: number;
  totalRemoved: number;
  outstandingByPrayer: Record<PrayerName, number>;
  completedByPrayer: Record<PrayerName, number>;
  completionPercentage: number;
  uniqueCompletionDaysCount: number;

  // Actions
  setPrayerStatus: (
    date: string,
    prayer: PrayerName,
    status: 'pending' | 'prayed' | 'missed',
    linkedQadaId?: string
  ) => DailyPrayerRecord;
  addQada: (
    prayer: PrayerName,
    missedDate: string,
    notes?: string,
    sourceDailyPrayerId?: string
  ) => { success: boolean; record?: QadaRecord; error?: string };
  completeQada: (id: string) => boolean;
  undoComplete: (id: string) => boolean;
  removeQada: (id: string) => boolean;
  editQada: (id: string, updates: Partial<Pick<QadaRecord, 'prayer' | 'missedDate' | 'notes'>>) => boolean;
  deletePermanently: (id: string) => boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAll: () => void;
  loadSamples: () => void;
}

const PrayerContext = createContext<PrayerContextType | null>(null);

export const PrayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyPrayers, setDailyPrayers] = useState<Record<string, DailyPrayerRecord>>({});
  const [qadaRecords, setQadaRecords] = useState<QadaRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'qada' | 'history' | 'settings'>('home');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Sync state with storage
  const syncFromStorage = () => {
    setDailyPrayers(getDailyPrayersMap());
    setQadaRecords(getQadaRecords());
    setSettings(getAppSettings());
  };

  useEffect(() => {
    syncFromStorage();
    const unsubscribe = subscribeToDataChanges(() => {
      syncFromStorage();
    });
    return unsubscribe;
  }, []);

  // Sync dark class on document element
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const showToast = (info: Omit<ToastInfo, 'id'>) => {
    const id = String(Date.now());
    setToast({ ...info, id });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Statistics calculation
  const {
    totalOutstanding,
    totalCompleted,
    totalRemoved,
    outstandingByPrayer,
    completedByPrayer,
    completionPercentage,
    uniqueCompletionDaysCount,
  } = useMemo(() => {
    let outCount = 0;
    let compCount = 0;
    let remCount = 0;

    const outByPrayer: Record<PrayerName, number> = { Fajr: 0, Zuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    const compByPrayer: Record<PrayerName, number> = { Fajr: 0, Zuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    const completionDays = new Set<string>();

    qadaRecords.forEach((r) => {
      if (r.status === 'outstanding') {
        outCount++;
        outByPrayer[r.prayer] = (outByPrayer[r.prayer] || 0) + 1;
      } else if (r.status === 'completed') {
        compCount++;
        compByPrayer[r.prayer] = (compByPrayer[r.prayer] || 0) + 1;
        if (r.completedAt) {
          const compDate = new Date(r.completedAt).toISOString().split('T')[0];
          completionDays.add(compDate);
        }
      } else if (r.status === 'removed') {
        remCount++;
      }
    });

    const totalTracked = outCount + compCount;
    const rate = totalTracked > 0 ? Math.round((compCount / totalTracked) * 100) : 0;

    return {
      totalOutstanding: outCount,
      totalCompleted: compCount,
      totalRemoved: remCount,
      outstandingByPrayer: outByPrayer,
      completedByPrayer: compByPrayer,
      completionPercentage: rate,
      uniqueCompletionDaysCount: completionDays.size,
    };
  }, [qadaRecords]);

  // Action handlers
  const handleSetPrayerStatus = (
    date: string,
    prayer: PrayerName,
    status: 'pending' | 'prayed' | 'missed',
    linkedQadaId?: string
  ) => {
    const updated = updateDailyPrayerStatus(date, prayer, status, linkedQadaId);
    if (status === 'prayed' && settings.soundEnabled) {
      playGentleChime();
    }
    return updated;
  };

  const handleAddQada = (
    prayer: PrayerName,
    missedDate: string,
    notes = '',
    sourceDailyPrayerId?: string
  ) => {
    const res = addQadaRecord(prayer, missedDate, notes, sourceDailyPrayerId);
    if (res.success) {
      showToast({
        type: 'success',
        message: `${prayer} prayer added to your Qada list.`,
      });
    } else {
      showToast({
        type: 'error',
        message: res.error || 'Failed to add Qada prayer.',
      });
    }
    return res;
  };

  const handleCompleteQada = (id: string) => {
    const res = completeQadaRecord(id);
    if (res.success && res.record) {
      const rec = res.record;
      if (settings.soundEnabled) {
        playSuccessChime();
      }
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#059669', '#10B981', '#34D399', '#FBBF24', '#D4AF37'],
        });
      } catch {
        // confetti fallback
      }

      showToast({
        type: 'success',
        message: `MashaAllah! ${rec.prayer} Qada marked as completed.`,
        undoLabel: 'Undo',
        onUndo: () => {
          undoCompleteQadaRecord(id);
          showToast({
            type: 'info',
            message: `${rec.prayer} Qada restored to outstanding list.`,
          });
        },
      });
      return true;
    }
    return false;
  };

  const handleUndoComplete = (id: string) => {
    const res = undoCompleteQadaRecord(id);
    if (res.success) {
      showToast({
        type: 'info',
        message: 'Completed prayer returned to outstanding list.',
      });
      return true;
    }
    return false;
  };

  const handleRemoveQada = (id: string) => {
    const res = removeQadaRecord(id);
    if (res.success && res.record) {
      const rec = res.record;
      showToast({
        type: 'info',
        message: `${rec.prayer} Qada entry removed.`,
        undoLabel: 'Undo',
        onUndo: () => {
          undoCompleteQadaRecord(id); // restores to outstanding
          showToast({
            type: 'info',
            message: `${rec.prayer} entry restored.`,
          });
        },
      });
      return true;
    }
    return false;
  };

  const handleEditQada = (
    id: string,
    updates: Partial<Pick<QadaRecord, 'prayer' | 'missedDate' | 'notes'>>
  ) => {
    const success = updateQadaRecord(id, updates);
    if (success) {
      showToast({
        type: 'success',
        message: 'Qada entry updated successfully.',
      });
    }
    return success;
  };

  const handleDeletePermanently = (id: string) => {
    const success = permanentlyDeleteQadaRecord(id);
    if (success) {
      showToast({
        type: 'info',
        message: 'Record permanently deleted.',
      });
    }
    return success;
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    saveAppSettings(newSettings);
    showToast({
      type: 'success',
      message: 'Preferences updated.',
    });
  };

  const handleResetAll = () => {
    clearAllApplicationData();
    showToast({
      type: 'warning',
      message: 'All application records have been reset.',
    });
  };

  const handleLoadSamples = () => {
    loadSampleRecords();
    showToast({
      type: 'success',
      message: 'Sample records loaded successfully.',
    });
  };

  return (
    <PrayerContext.Provider
      value={{
        dailyPrayers,
        qadaRecords,
        settings,
        activeTab,
        setActiveTab,
        selectedCalendarDate,
        setSelectedCalendarDate,
        toast,
        showToast,
        dismissToast,
        totalOutstanding,
        totalCompleted,
        totalRemoved,
        outstandingByPrayer,
        completedByPrayer,
        completionPercentage,
        uniqueCompletionDaysCount,
        setPrayerStatus: handleSetPrayerStatus,
        addQada: handleAddQada,
        completeQada: handleCompleteQada,
        undoComplete: handleUndoComplete,
        removeQada: handleRemoveQada,
        editQada: handleEditQada,
        deletePermanently: handleDeletePermanently,
        updateSettings: handleUpdateSettings,
        resetAll: handleResetAll,
        loadSamples: handleLoadSamples,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
};

export function usePrayer(): PrayerContextType {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
}
