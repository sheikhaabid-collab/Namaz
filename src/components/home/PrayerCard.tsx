import React from 'react';
import { DailyPrayerRecord, PrayerName, PRAYER_DETAILS } from '../../types/prayer';
import { PrayerIcon } from '../common/PrayerIcon';
import { Check, X, Clock, BookmarkCheck } from 'lucide-react';

interface PrayerCardProps {
  prayer: PrayerName;
  record: DailyPrayerRecord;
  hasOutstandingQada?: boolean;
  onSetStatus: (status: 'pending' | 'prayed' | 'missed') => void;
  onMarkMissedWithPrompt: () => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  record,
  hasOutstandingQada,
  onSetStatus,
  onMarkMissedWithPrompt,
}) => {
  const details = PRAYER_DETAILS[prayer];
  const status = record.status;

  const getStatusBadge = () => {
    switch (status) {
      case 'prayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40">
            <Check className="w-3 h-3 stroke-[2.5]" />
            Prayed
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300/40">
            <X className="w-3 h-3 stroke-[2.5]" />
            {hasOutstandingQada || record.qadaId ? 'Missed (In Qada)' : 'Missed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 transition-all border ${
        status === 'prayed'
          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 shadow-xs'
          : status === 'missed'
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Icon & info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
              status === 'prayed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : status === 'missed'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400'
            }`}
          >
            <PrayerIcon prayer={prayer} size={22} />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {prayer}
              </h4>
              <span className="font-arabic text-sm text-slate-500 dark:text-slate-400">
                {details.arabic}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {details.timeOfDay} • {details.rakats}
            </p>
          </div>
        </div>

        {/* Right: Badge */}
        <div>{getStatusBadge()}</div>
      </div>

      {/* Action buttons row */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          {/* Prayed Button */}
          <button
            type="button"
            onClick={() => onSetStatus('prayed')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              status === 'prayed'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Prayed
          </button>

          {/* Missed Button */}
          <button
            type="button"
            onClick={() => {
              if (status === 'missed') {
                // Already marked missed, prompt if they want to ensure it's in Qada
                onMarkMissedWithPrompt();
              } else {
                onMarkMissedWithPrompt();
              }
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              status === 'missed'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            Missed
          </button>
        </div>

        {/* Pending / Reset Status */}
        {status !== 'pending' && (
          <button
            type="button"
            onClick={() => onSetStatus('pending')}
            title="Reset to pending"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
