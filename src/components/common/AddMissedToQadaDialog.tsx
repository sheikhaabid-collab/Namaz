import React, { useState } from 'react';
import { PrayerName } from '../../types/prayer';
import { formatReadableDate } from '../../utils/dateUtils';
import { PrayerIcon } from './PrayerIcon';
import { AlertTriangle, PlusCircle, X } from 'lucide-react';
import { findExistingQada } from '../../services/storage';

interface AddMissedToQadaDialogProps {
  isOpen: boolean;
  prayer: PrayerName;
  dateKey: string;
  sourceDailyPrayerId?: string;
  onConfirm: (notes: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}

export const AddMissedToQadaDialog: React.FC<AddMissedToQadaDialogProps> = ({
  isOpen,
  prayer,
  dateKey,
  onConfirm,
  onSkip,
  onCancel,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const existing = findExistingQada(prayer, dateKey);
  const isAlreadyOutstanding = Boolean(existing.outstanding);
  const isAlreadyCompleted = Boolean(existing.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PrayerIcon prayer={prayer} size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Add to Qada List?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {prayer} Salah • {formatReadableDate(dateKey)}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          {isAlreadyOutstanding ? (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 flex gap-2.5 items-start text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                An outstanding Qada entry for this prayer and date already exists in your Qada List. You do not need to add another.
              </span>
            </div>
          ) : isAlreadyCompleted ? (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 flex gap-2.5 items-start text-xs text-blue-800 dark:text-blue-200">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Notice: A previously completed Qada for this date already exists in history. Adding this will register a new outstanding entry.
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You marked <strong>{prayer}</strong> as missed. Would you like to record it in your <strong>Qada List</strong> so you can make it up later?
            </p>
          )}

          {!isAlreadyOutstanding && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Optional reason or note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Travel, illness, overslept..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {!isAlreadyOutstanding ? (
            <button
              onClick={() => onConfirm(notes)}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add to Qada List
            </button>
          ) : null}

          <button
            onClick={onSkip}
            className="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {isAlreadyOutstanding ? 'Close' : 'No, just mark as missed without Qada'}
          </button>
        </div>
      </div>
    </div>
  );
};
