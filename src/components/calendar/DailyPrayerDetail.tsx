import React, { useState } from 'react';
import { DailyPrayerRecord, PrayerName, PRAYER_NAMES, PRAYER_DETAILS } from '../../types/prayer';
import {
  formatReadableDate,
  getHijriDate,
  getTodayDateString,
  shiftDateDays,
} from '../../utils/dateUtils';
import { PrayerIcon } from '../common/PrayerIcon';
import { AddMissedToQadaDialog } from '../common/AddMissedToQadaDialog';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { usePrayer } from '../../context/PrayerContext';

interface DailyPrayerDetailProps {
  dateKey: string;
  onSelectDate: (dateKey: string) => void;
  onOpenAddQadaManual: (initialDate: string) => void;
}

export const DailyPrayerDetail: React.FC<DailyPrayerDetailProps> = ({
  dateKey,
  onSelectDate,
  onOpenAddQadaManual,
}) => {
  const { dailyPrayers, qadaRecords, setPrayerStatus, addQada } = usePrayer();
  const todayKey = getTodayDateString();
  const isToday = dateKey === todayKey;

  const [missedPrompt, setMissedPrompt] = useState<{
    isOpen: boolean;
    prayer: PrayerName;
  } | null>(null);

  const readableDate = formatReadableDate(dateKey);
  const hijriDate = getHijriDate(dateKey);

  const handlePrevDay = () => {
    onSelectDate(shiftDateDays(dateKey, -1));
  };

  const handleNextDay = () => {
    onSelectDate(shiftDateDays(dateKey, 1));
  };

  const handleQuickToday = () => {
    onSelectDate(todayKey);
  };

  const handleConfirmAddQada = (notes: string) => {
    if (!missedPrompt) return;
    const { prayer } = missedPrompt;
    const dailyId = `${dateKey}_${prayer}`;

    setPrayerStatus(dateKey, prayer, 'missed');
    addQada(prayer, dateKey, notes, dailyId);
    setMissedPrompt(null);
  };

  const handleSkipAddQada = () => {
    if (!missedPrompt) return;
    const { prayer } = missedPrompt;
    setPrayerStatus(dateKey, prayer, 'missed');
    setMissedPrompt(null);
  };

  // Get records for all 5 prayers on this date
  const prayers = PRAYER_NAMES.map((prayer) => {
    const id = `${dateKey}_${prayer}`;
    return (
      dailyPrayers[id] || {
        id,
        date: dateKey,
        prayer,
        status: 'pending' as const,
        updatedAt: 0,
      }
    );
  });

  const prayedCount = prayers.filter((p) => p.status === 'prayed').length;
  const missedCount = prayers.filter((p) => p.status === 'missed').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
      {/* Day Stepper & Date Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Previous Day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex-1 px-2">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {readableDate}
            </h3>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Today
              </span>
            )}
          </div>
          {hijriDate && (
            <p className="text-xs text-amber-700/80 dark:text-amber-400 font-arabic mt-0.5">
              {hijriDate}
            </p>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Next Day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Date Quick Actions / Return to Today */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            {prayedCount} Prayed
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            {missedCount} Missed
          </span>
        </div>

        {!isToday && (
          <button
            onClick={handleQuickToday}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Jump to Today
          </button>
        )}
      </div>

      {/* 5 Daily Prayers List */}
      <div className="space-y-2">
        {prayers.map((rec) => {
          const prayer = rec.prayer;
          const status = rec.status;
          const details = PRAYER_DETAILS[prayer];
          const hasQada = Boolean(
            rec.qadaId ||
            qadaRecords.some(
              (q) =>
                q.prayer === prayer &&
                q.missedDate === dateKey &&
                q.status === 'outstanding'
            )
          );

          return (
            <div
              key={prayer}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                status === 'prayed'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                  : status === 'missed'
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {/* Prayer Info */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    status === 'prayed'
                      ? 'bg-emerald-600 text-white'
                      : status === 'missed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <PrayerIcon prayer={prayer} size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {prayer}
                    </span>
                    <span className="text-xs font-arabic text-slate-500 dark:text-slate-400">
                      {details.arabic}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {details.timeOfDay} • {details.rakats}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPrayerStatus(dateKey, prayer, 'prayed')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    status === 'prayed'
                      ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                  title="Mark as prayed on time"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Prayed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMissedPrompt({ isOpen: true, prayer });
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    status === 'missed'
                      ? 'bg-rose-700 text-white shadow-xs ring-1 ring-rose-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400'
                  }`}
                  title="Mark as missed"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">
                    {hasQada ? 'In Qada' : 'Missed'}
                  </span>
                </button>

                {status !== 'pending' && (
                  <button
                    type="button"
                    onClick={() => setPrayerStatus(dateKey, prayer, 'pending')}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Reset to Pending"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Quick Add Qada button for this date */}
      <div className="pt-2">
        <button
          onClick={() => onOpenAddQadaManual(dateKey)}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-600/40 hover:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Missed Qada for {readableDate}
        </button>
      </div>

      {/* Missed Prayer Prompt Dialog */}
      {missedPrompt && (
        <AddMissedToQadaDialog
          isOpen={missedPrompt.isOpen}
          prayer={missedPrompt.prayer}
          dateKey={dateKey}
          onConfirm={handleConfirmAddQada}
          onSkip={handleSkipAddQada}
          onCancel={() => setMissedPrompt(null)}
        />
      )}
    </div>
  );
};
