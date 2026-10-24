import React, { useState } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import { PrayerName, PRAYER_NAMES } from '../../types/prayer';
import {
  formatReadableDate,
  getHijriDate,
  getTodayDateString,
} from '../../utils/dateUtils';
import { PrayerCard } from './PrayerCard';
import { AddMissedToQadaDialog } from '../common/AddMissedToQadaDialog';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    dailyPrayers,
    qadaRecords,
    setPrayerStatus,
    addQada,
    setActiveTab,
    setSelectedCalendarDate,
    totalOutstanding,
    totalCompleted,
    completionPercentage,
  } = usePrayer();

  const todayKey = getTodayDateString();
  const hijriStr = getHijriDate(todayKey);
  const formattedToday = formatReadableDate(todayKey);

  // Modal prompt state for marking a prayer missed
  const [missedPrompt, setMissedPrompt] = useState<{
    isOpen: boolean;
    prayer: PrayerName;
  } | null>(null);

  const handleOpenMissedPrompt = (prayer: PrayerName) => {
    setMissedPrompt({
      isOpen: true,
      prayer,
    });
  };

  const handleConfirmAddQada = (notes: string) => {
    if (!missedPrompt) return;
    const { prayer } = missedPrompt;
    const dailyId = `${todayKey}_${prayer}`;

    // 1. Mark status as missed in daily record
    setPrayerStatus(todayKey, prayer, 'missed');

    // 2. Add Qada entry
    addQada(prayer, todayKey, notes, dailyId);

    setMissedPrompt(null);
  };

  const handleSkipAddQada = () => {
    if (!missedPrompt) return;
    const { prayer } = missedPrompt;
    // User marks missed, but declined adding to Qada
    setPrayerStatus(todayKey, prayer, 'missed');
    setMissedPrompt(null);
  };

  // Check today's completion count
  const todayPrayers = PRAYER_NAMES.map((prayer) => {
    const id = `${todayKey}_${prayer}`;
    return (
      dailyPrayers[id] || {
        id,
        date: todayKey,
        prayer,
        status: 'pending' as const,
        updatedAt: 0,
      }
    );
  });

  const todayPrayedCount = todayPrayers.filter((p) => p.status === 'prayed').length;

  return (
    <div className="pb-24 pt-3 max-w-md mx-auto px-4 space-y-5">
      {/* Hero Header & Peaceful Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-5 shadow-xl border border-emerald-700/50">
        {/* Subtle geometric star backdrop */}
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50 0, 61 35, 98 35, 68 57, 79 91, 50 70, 21 91, 32 57, 2 35, 39 35" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Daily Reflection
            </span>
            {hijriStr && (
              <span className="text-xs font-arabic text-amber-200/90 tracking-wide">
                {hijriStr}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
            Assalamu Alaikum
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5 leading-relaxed">
            {formattedToday}
          </p>

          <p className="mt-2 text-xs italic text-emerald-200/75">
            &ldquo;Indeed, prayer has been decreed upon the believers a decree of specified times.&rdquo;
          </p>

          {/* Quick today status pills */}
          <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs">
            <span className="text-emerald-200">Today&apos;s Salah Completed:</span>
            <span className="font-bold text-amber-300 text-sm">
              {todayPrayedCount} / 5
            </span>
          </div>
        </div>
      </div>

      {/* Qada Statistics & Quick Action Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Qada Tracker Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your overall make-up prayer balance
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            {completionPercentage}% Fulfilled
          </span>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Outstanding Qada
            </div>
            <div className="mt-1.5 text-2xl font-extrabold text-amber-950 dark:text-amber-100">
              {totalOutstanding}
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-400">
              Prayers waiting to be made up
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Qada Completed
            </div>
            <div className="mt-1.5 text-2xl font-extrabold text-emerald-950 dark:text-emerald-100">
              {totalCompleted}
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
              Prayers fulfilled so far
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Overall Progress</span>
            <span>{totalCompleted} completed • {totalOutstanding} pending</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(totalCompleted > 0 ? 5 : 0, completionPercentage))}%` }}
            />
          </div>
        </div>

        {/* Buttons to Qada List and Calendar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setActiveTab('qada')}
            className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            Open Qada List
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedCalendarDate(todayKey);
              setActiveTab('calendar');
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            Open Calendar
          </button>
        </div>
      </div>

      {/* Today's 5 Daily Prayers Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Today&apos;s Prayers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record your daily Salah in sequence
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCalendarDate(todayKey);
              setActiveTab('calendar');
            }}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Daily Log
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* The 5 prayers in exact order */}
        <div className="space-y-2.5">
          {PRAYER_NAMES.map((prayer) => {
            const dailyId = `${todayKey}_${prayer}`;
            const record = dailyPrayers[dailyId] || {
              id: dailyId,
              date: todayKey,
              prayer,
              status: 'pending',
              updatedAt: 0,
            };

            const hasQada = Boolean(
              record.qadaId ||
              qadaRecords.some(
                (q) =>
                  q.prayer === prayer &&
                  q.missedDate === todayKey &&
                  q.status === 'outstanding'
              )
            );

            return (
              <PrayerCard
                key={prayer}
                prayer={prayer}
                record={record}
                hasOutstandingQada={hasQada}
                onSetStatus={(status) => {
                  if (status === 'missed') {
                    handleOpenMissedPrompt(prayer);
                  } else {
                    setPrayerStatus(todayKey, prayer, status);
                  }
                }}
                onMarkMissedWithPrompt={() => handleOpenMissedPrompt(prayer)}
              />
            );
          })}
        </div>
      </div>

      {/* Missed Prayer Prompt Dialog */}
      {missedPrompt && (
        <AddMissedToQadaDialog
          isOpen={missedPrompt.isOpen}
          prayer={missedPrompt.prayer}
          dateKey={todayKey}
          onConfirm={handleConfirmAddQada}
          onSkip={handleSkipAddQada}
          onCancel={() => setMissedPrompt(null)}
        />
      )}
    </div>
  );
};
