import React, { useMemo, useState } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import {
  getMonthCalendarDays,
  getTodayDateString,
  parseDateKey,
} from '../../utils/dateUtils';
import { DailyPrayerDetail } from './DailyPrayerDetail';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronsLeft,
  ChevronsRight,
  Info,
} from 'lucide-react';
import { AddQadaDialog } from '../qada/AddQadaDialog';

export const CalendarView: React.FC = () => {
  const {
    dailyPrayers,
    qadaRecords,
    selectedCalendarDate,
    setSelectedCalendarDate,
    addQada,
  } = usePrayer();

  const todayKey = getTodayDateString();

  // Navigation state (year & monthIndex)
  const initialDate = useMemo(
    () => parseDateKey(selectedCalendarDate || todayKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialDate.getMonth());

  // Manual Add Qada Modal
  const [addQadaModalDate, setAddQadaModalDate] = useState<string | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handlePrevYear = () => {
    setCurrentYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((y) => y + 1);
  };

  const handleReturnToToday = () => {
    const today = parseDateKey(todayKey);
    setCurrentYear(today.getFullYear());
    setCurrentMonthIndex(today.getMonth());
    setSelectedCalendarDate(todayKey);
  };

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
  }).format(new Date(currentYear, currentMonthIndex, 1));

  // Calendar cells
  const calendarDays = useMemo(
    () => getMonthCalendarDays(currentYear, currentMonthIndex),
    [currentYear, currentMonthIndex]
  );

  // Map dates to prayer summaries for calendar dots
  const dateSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        prayedCount: number;
        missedCount: number;
        hasOutstandingQada: boolean;
      }
    >();

    // Analyze dailyPrayers
    Object.values(dailyPrayers).forEach((record) => {
      const current = map.get(record.date) || {
        prayedCount: 0,
        missedCount: 0,
        hasOutstandingQada: false,
      };
      if (record.status === 'prayed') current.prayedCount++;
      if (record.status === 'missed') current.missedCount++;
      map.set(record.date, current);
    });

    // Analyze Qada records for missed/outstanding markers
    qadaRecords.forEach((q) => {
      const current = map.get(q.missedDate) || {
        prayedCount: 0,
        missedCount: 0,
        hasOutstandingQada: false,
      };
      if (q.status === 'outstanding') {
        current.hasOutstandingQada = true;
        current.missedCount = Math.max(current.missedCount, 1);
      }
      map.set(q.missedDate, current);
    });

    return map;
  }, [dailyPrayers, qadaRecords]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="pb-24 pt-3 max-w-md mx-auto px-4 space-y-5">
      {/* Calendar Header / Navigation Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevYear}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Year"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {monthName} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextYear}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Year"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick jump to Today bar */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleReturnToToday}
            className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Return to Today
          </button>

          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            Tap any date to log Salah
          </span>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((cell) => {
            const isSelected = cell.dateKey === selectedCalendarDate;
            const summary = dateSummaries.get(cell.dateKey);
            const hasPrayed = (summary?.prayedCount || 0) > 0;
            const isAllPrayed = (summary?.prayedCount || 0) === 5;
            const hasMissed = (summary?.missedCount || 0) > 0;
            const hasOutstandingQada = Boolean(summary?.hasOutstandingQada);

            return (
              <button
                key={cell.dateKey}
                onClick={() => setSelectedCalendarDate(cell.dateKey)}
                type="button"
                className={`min-h-[46px] p-1 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/50 font-bold scale-105 z-10'
                    : cell.isToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-400/50'
                    : cell.isCurrentMonth
                    ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium'
                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/30 font-normal'
                }`}
              >
                <span className="text-xs leading-none">{cell.dayNumber}</span>

                {/* Status indicator dots */}
                <div className="flex items-center gap-0.5 mt-1 min-h-[5px]">
                  {isAllPrayed ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-emerald-600'
                      }`}
                      title="All 5 prayers completed"
                    />
                  ) : hasPrayed ? (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                      }`}
                      title="Some prayers performed"
                    />
                  ) : null}

                  {hasOutstandingQada ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-rose-500'
                      }`}
                      title="Missed prayer in Qada"
                    />
                  ) : hasMissed ? (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-amber-200' : 'bg-rose-400'
                      }`}
                      title="Missed prayer recorded"
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Prayed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Missed / Qada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-emerald-500 bg-emerald-50 dark:bg-emerald-950" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Detailed Daily View for Selected Date */}
      <DailyPrayerDetail
        dateKey={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
        onOpenAddQadaManual={(d) => setAddQadaModalDate(d)}
      />

      {/* Manual Add Qada Modal if invoked from Calendar */}
      {addQadaModalDate && (
        <AddQadaDialog
          isOpen={Boolean(addQadaModalDate)}
          onClose={() => setAddQadaModalDate(null)}
          onAdd={(p, d, notes) => {
            addQada(p, d, notes);
          }}
        />
      )}
    </div>
  );
};
