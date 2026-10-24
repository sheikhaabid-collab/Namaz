import React, { useState } from 'react';
import { PrayerName, PRAYER_NAMES, PRAYER_DETAILS } from '../../types/prayer';
import { getTodayDateString, shiftDateDays } from '../../utils/dateUtils';
import { PrayerIcon } from '../common/PrayerIcon';
import { AlertCircle, AlertTriangle, Calendar, Plus, X } from 'lucide-react';
import { findExistingQada } from '../../services/storage';

interface AddQadaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (prayer: PrayerName, missedDate: string, notes: string) => void;
}

export const AddQadaDialog: React.FC<AddQadaDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [selectedPrayers, setSelectedPrayers] = useState<PrayerName[]>(['Fajr']);
  const [missedDate, setMissedDate] = useState<string>(() => shiftDateDays(getTodayDateString(), -1));
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showWarningForCompleted, setShowWarningForCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const togglePrayer = (prayer: PrayerName) => {
    setErrorMsg(null);
    setShowWarningForCompleted(false);
    if (selectedPrayers.includes(prayer)) {
      if (selectedPrayers.length > 1) {
        setSelectedPrayers(selectedPrayers.filter((p) => p !== prayer));
      }
    } else {
      setSelectedPrayers([...selectedPrayers, prayer]);
    }
  };

  const handleValidateAndSubmit = (force = false) => {
    setErrorMsg(null);

    if (!missedDate) {
      setErrorMsg('Please select a valid date.');
      return;
    }

    if (selectedPrayers.length === 0) {
      setErrorMsg('Please select at least one prayer.');
      return;
    }

    // Check duplicates for each selected prayer
    const blockedPrayers: string[] = [];
    const completedPrayers: string[] = [];

    for (const p of selectedPrayers) {
      const existing = findExistingQada(p, missedDate);
      if (existing.outstanding) {
        blockedPrayers.push(p);
      } else if (existing.completed) {
        completedPrayers.push(p);
      }
    }

    if (blockedPrayers.length > 0) {
      setErrorMsg(
        `Duplicate prevented: Outstanding Qada already exists for ${blockedPrayers.join(', ')} on ${missedDate}.`
      );
      return;
    }

    if (completedPrayers.length > 0 && !force && !showWarningForCompleted) {
      setShowWarningForCompleted(true);
      return;
    }

    // Add each selected prayer
    selectedPrayers.forEach((p) => {
      onAdd(p, missedDate, notes);
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Record Missed Prayer (Qada)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add to your make-up prayer queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Prayer multi-selector buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Prayer(s)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRAYER_NAMES.map((prayer) => {
                const isSelected = selectedPrayers.includes(prayer);
                return (
                  <button
                    key={prayer}
                    type="button"
                    onClick={() => togglePrayer(prayer)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                    }`}
                  >
                    <PrayerIcon
                      prayer={prayer}
                      size={20}
                      className={isSelected ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}
                    />
                    <span className="text-xs font-semibold mt-1">{prayer}</span>
                    <span className="text-[10px] opacity-75 font-arabic">
                      {PRAYER_DETAILS[prayer].arabic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Original Missed Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={missedDate}
                max={getTodayDateString()}
                onChange={(e) => {
                  setMissedDate(e.target.value);
                  setErrorMsg(null);
                  setShowWarningForCompleted(false);
                }}
                className="w-full px-3.5 py-2.5 pl-10 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setMissedDate(getTodayDateString())}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setMissedDate(shiftDateDays(getTodayDateString(), -1))}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setMissedDate(shiftDateDays(getTodayDateString(), -7))}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                1 Week Ago
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Personal Note <span className="lowercase font-normal opacity-70">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Travel, illness, fatigue..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Validation Error */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Completed Qada Warning */}
          {showWarningForCompleted && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  A completed Qada record already exists for this prayer on this date. Are you sure you want to add another entry?
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowWarningForCompleted(false)}
                  className="px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateAndSubmit(true)}
                  className="px-3 py-1 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Confirm & Add Anyway
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleValidateAndSubmit(false)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-medium text-sm shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Save Qada {selectedPrayers.length > 1 ? `(${selectedPrayers.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
