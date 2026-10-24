import React, { useRef, useState } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import { PRAYER_NAMES, PrayerName, PRAYER_DETAILS } from '../../types/prayer';
import {
  exportBackupData,
  generateQadaCSV,
  importBackupData,
} from '../../services/storage';
import { playGentleChime, playSuccessChime } from '../../services/audio';
import {
  isNotificationSupported,
  requestNotificationPermission,
  triggerPrayerNotification,
} from '../../services/notifications';
import {
  ArrowLeft,
  Bell,
  Download,
  FileSpreadsheet,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const {
    settings,
    updateSettings,
    showToast,
    resetAll,
    loadSamples,
  } = usePrayer();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importPendingJson, setImportPendingJson] = useState<string | null>(null);

  // Export JSON backup
  const handleExportJSON = () => {
    try {
      const dataStr = exportBackupData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `qadamate_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        message: 'Backup downloaded successfully.',
      });
    } catch {
      showToast({
        type: 'error',
        message: 'Could not export backup.',
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const csvStr = generateQadaCSV();
      const blob = new Blob([csvStr], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `qadamate_qada_list_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        message: 'CSV file exported successfully.',
      });
    } catch {
      showToast({
        type: 'error',
        message: 'Could not export CSV.',
      });
    }
  };

  // File picker handler for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportPendingJson(content);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeImport = (mode: 'replace' | 'merge') => {
    if (!importPendingJson) return;

    const result = importBackupData(importPendingJson, mode);
    if (result.success && result.count) {
      showToast({
        type: 'success',
        message: `Restored ${result.count.qada} Qada records and ${result.count.daily} daily logs.`,
      });
    } else {
      showToast({
        type: 'error',
        message: result.error || 'Failed to restore backup.',
      });
    }
    setImportPendingJson(null);
  };

  const handleTestNotification = async () => {
    if (!isNotificationSupported()) {
      showToast({
        type: 'warning',
        message: 'Push notifications are not supported by this browser.',
      });
      return;
    }

    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      triggerPrayerNotification(
        'Asr',
        'Time for Asr Salah. Keep your prayer on time and remember Allah.'
      );
      showToast({
        type: 'success',
        message: 'Test notification & chime sent.',
      });
    } else {
      showToast({
        type: 'warning',
        message: 'Please allow notification permissions in your browser.',
      });
    }
  };

  const handleUpdateTime = (prayer: PrayerName, time: string) => {
    const currentTimes = { ...settings.reminderTimes };
    currentTimes[prayer] = {
      ...currentTimes[prayer],
      time,
    };
    updateSettings({ reminderTimes: currentTimes });
  };

  const handleToggleReminder = (prayer: PrayerName) => {
    const currentTimes = { ...settings.reminderTimes };
    currentTimes[prayer] = {
      ...currentTimes[prayer],
      enabled: !currentTimes[prayer]?.enabled,
    };
    updateSettings({ reminderTimes: currentTimes });
  };

  return (
    <div className="pb-28 pt-3 max-w-md mx-auto px-4 space-y-5">
      {/* Top Bar with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            App Settings & Data
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Preferences, backup, restore & prayer alerts
          </p>
        </div>
      </div>

      {/* Visual Theme & Audio Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Preferences & Audio
        </h3>

        {/* Theme Picker */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Color Theme
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Switch between soft cream light mode and nocturnal dark mode
            </div>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                settings.theme === 'light'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-500'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                settings.theme === 'dark'
                  ? 'bg-slate-900 text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-500'
              }`}
            >
              <Moon className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Chime Sound Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Peaceful Chime Feedback</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Plays gentle harmonic sound when completing Salah or Qada
            </div>
          </div>
          <button
            onClick={() => {
              const next = !settings.soundEnabled;
              updateSettings({ soundEnabled: next });
              if (next) playSuccessChime();
            }}
            className={`p-2 rounded-xl transition-colors ${
              settings.soundEnabled
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Prayer Reminders & Push Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Salah Reminders & Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Receive alert notifications for upcoming daily prayer times
            </p>
          </div>
          <button
            onClick={handleTestNotification}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40"
          >
            Test Alert
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          {PRAYER_NAMES.map((prayer) => {
            const config = settings.reminderTimes?.[prayer] || { enabled: true, time: '12:00' };

            return (
              <div
                key={prayer}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`remind-${prayer}`}
                    checked={config.enabled}
                    onChange={() => handleToggleReminder(prayer)}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 accent-emerald-700"
                  />
                  <label
                    htmlFor={`remind-${prayer}`}
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {prayer} Salah
                  </label>
                  <span className="text-[10px] text-slate-400 font-arabic">
                    {PRAYER_DETAILS[prayer].arabic}
                  </span>
                </div>

                <input
                  type="time"
                  value={config.time}
                  onChange={(e) => handleUpdateTime(prayer, e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Backup & Data Restore
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Safeguard your Qada history so you never lose your records
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExportJSON}
            className="py-3 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors border border-emerald-200/60 dark:border-emerald-800/40"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-3 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Qada CSV</span>
          </button>
        </div>

        <div className="pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            Import / Restore JSON File
          </button>
        </div>
      </div>

      {/* Developer / Demonstration & Reset Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Sample Data & Clear Storage
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test features with sample records or reset back to blank slate
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={loadSamples}
            className="py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-200/60 dark:border-amber-800/40"
          >
            <Database className="w-4 h-4" />
            Load Sample Data
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200/60 dark:border-rose-800/40"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </button>
        </div>
      </div>

      {/* Confirmation modal for Reset All */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset All Application Data?"
        message="This will completely clear all your recorded daily prayers, Qada records, and history from your browser. Are you sure you want to proceed?"
        confirmLabel="Yes, Reset Everything"
        cancelLabel="Keep My Data"
        variant="danger"
        onConfirm={() => {
          setShowResetConfirm(false);
          resetAll();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Confirmation modal for Import Backup */}
      {importPendingJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Restore Backup File
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose how you want to restore the file
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Replace:</strong> Completely overwrites current data with the backup file.
              <br />
              <strong>Merge:</strong> Keeps current entries and adds missing records from the backup.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => executeImport('replace')}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Replace Existing Data
              </button>
              <button
                onClick={() => executeImport('merge')}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Merge with Existing Data
              </button>
              <button
                onClick={() => setImportPendingJson(null)}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
