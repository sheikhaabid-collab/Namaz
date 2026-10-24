import React, { useState } from 'react';
import { PrayerName, PRAYER_NAMES, QadaRecord } from '../../types/prayer';
import { getTodayDateString } from '../../utils/dateUtils';
import { PrayerIcon } from '../common/PrayerIcon';
import { Calendar, Edit3, X } from 'lucide-react';

interface EditQadaDialogProps {
  isOpen: boolean;
  record: QadaRecord | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Pick<QadaRecord, 'prayer' | 'missedDate' | 'notes'>>) => void;
}

export const EditQadaDialog: React.FC<EditQadaDialogProps> = ({
  isOpen,
  record,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const [prayer, setPrayer] = useState<PrayerName>(record.prayer);
  const [missedDate, setMissedDate] = useState<string>(record.missedDate);
  const [notes, setNotes] = useState<string>(record.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(record.id, {
      prayer,
      missedDate,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Edit Qada Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Prayer
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRAYER_NAMES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrayer(p)}
                  className={`py-2 px-1 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                    prayer === p
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <PrayerIcon prayer={p} size={16} />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Missed Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={missedDate}
                max={getTodayDateString()}
                onChange={(e) => setMissedDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 pl-10 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Travel, illness..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-medium text-sm shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
