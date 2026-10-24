import React, { useMemo, useState } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import { PrayerName, PRAYER_NAMES, PRAYER_DETAILS } from '../../types/prayer';
import { formatReadableDate, formatDateTime, formatShortDate } from '../../utils/dateUtils';
import { PrayerIcon } from '../common/PrayerIcon';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trash2,
  TrendingUp,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const HistoryScreen: React.FC = () => {
  const {
    qadaRecords,
    totalCompleted,
    totalOutstanding,
    totalRemoved,
    completedByPrayer,
    uniqueCompletionDaysCount,
    completionPercentage,
    undoComplete,
    deletePermanently,
  } = usePrayer();

  const [activeSubTab, setActiveSubTab] = useState<'completed' | 'removed'>('completed');
  const [purgeTargetId, setPurgeTargetId] = useState<string | null>(null);

  // Completed records sorted by completion date (most recent first)
  const completedRecords = useMemo(() => {
    return qadaRecords
      .filter((r) => r.status === 'completed')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [qadaRecords]);

  // Removed records
  const removedRecords = useMemo(() => {
    return qadaRecords
      .filter((r) => r.status === 'removed')
      .sort((a, b) => (b.removedAt || 0) - (a.removedAt || 0));
  }, [qadaRecords]);

  // Weekly & Monthly calculations
  const { completedThisWeek, completedThisMonth } = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    let weekCount = 0;
    let monthCount = 0;

    completedRecords.forEach((r) => {
      if (r.completedAt && r.completedAt >= oneWeekAgo) {
        weekCount++;
      }
      if (r.completedAt && r.completedAt >= oneMonthAgo) {
        monthCount++;
      }
    });

    return { completedThisWeek: weekCount, completedThisMonth: monthCount };
  }, [completedRecords]);

  return (
    <div className="pb-28 pt-3 max-w-md mx-auto px-4 space-y-5">
      {/* Overview Statistics Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                Qada Journey
              </h2>
              <p className="text-xs text-emerald-200/80">
                Milestones & Completed History
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-100">
            {completionPercentage}% Made Up
          </span>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-2xl p-3">
            <span className="text-[11px] text-emerald-200">Total Fulfilled</span>
            <div className="text-2xl font-extrabold text-amber-300 mt-0.5">
              {totalCompleted}
            </div>
            <span className="text-[10px] text-emerald-300/80">Prayers completed</span>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-2xl p-3">
            <span className="text-[11px] text-emerald-200">Active Days</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {uniqueCompletionDaysCount}
            </div>
            <span className="text-[10px] text-emerald-300/80">Unique make-up days</span>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-2xl p-3">
            <span className="text-[11px] text-emerald-200">Last 7 Days</span>
            <div className="text-xl font-bold text-white mt-0.5">
              +{completedThisWeek}
            </div>
            <span className="text-[10px] text-emerald-300/80">Fulfilled this week</span>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-2xl p-3">
            <span className="text-[11px] text-emerald-200">Remaining</span>
            <div className="text-xl font-bold text-amber-200 mt-0.5">
              {totalOutstanding}
            </div>
            <span className="text-[10px] text-emerald-300/80">Outstanding queue</span>
          </div>
        </div>
      </div>

      {/* Completed Prayers by Type Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          Completed Prayers by Type
        </h3>

        <div className="space-y-2.5 pt-1">
          {PRAYER_NAMES.map((prayer) => {
            const count = completedByPrayer[prayer] || 0;
            const maxVal = Math.max(...Object.values(completedByPrayer), 1);
            const barWidth = Math.round((count / maxVal) * 100);

            return (
              <div key={prayer} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <PrayerIcon prayer={prayer} size={14} className="text-emerald-700 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {prayer}
                    </span>
                    <span className="text-slate-400 font-arabic text-[11px]">
                      {PRAYER_DETAILS[prayer].arabic}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${count > 0 ? Math.max(8, barWidth) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Tabs (Completed vs Removed) */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('completed')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'completed'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed ({totalCompleted})
          </button>
          <button
            onClick={() => setActiveSubTab('removed')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'removed'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Removed ({totalRemoved})
          </button>
        </div>

        {/* Section A: Completed Qada Prayers */}
        {activeSubTab === 'completed' && (
          <div className="space-y-2.5">
            {completedRecords.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No Completed Qada Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  When you make up a prayer from the Qada List and tap &quot;Mark as Completed&quot;, it will appear here.
                </p>
              </div>
            ) : (
              completedRecords.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-emerald-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                        <PrayerIcon prayer={item.prayer} size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.prayer} Salah
                        </h4>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Completed on{' '}
                          {item.completedAt ? formatDateTime(item.completedAt) : 'Recorded'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => undoComplete(item.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
                      title="Undo completion and move back to outstanding list"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Undo
                    </button>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Original Missed Date: {formatReadableDate(item.missedDate)}</span>
                    </div>
                    {item.notes && (
                      <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="italic">&ldquo;{item.notes}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Section B: Removed or Cancelled Qada Entries */}
        {activeSubTab === 'removed' && (
          <div className="space-y-2.5">
            {removedRecords.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No Removed Entries
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Entries removed without completion are kept here for transparency and do not count toward completed prayers.
                </p>
              </div>
            ) : (
              removedRecords.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/70 dark:border-slate-800 space-y-2 opacity-85"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center">
                        <PrayerIcon prayer={item.prayer} size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-through">
                          {item.prayer} Salah
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Removed from Qada queue
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => undoComplete(item.id)} // restores status to outstanding
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg flex items-center gap-1 transition-colors"
                        title="Restore this entry to outstanding list"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        onClick={() => setPurgeTargetId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
                    <div>Original Missed Date: {formatReadableDate(item.missedDate)}</div>
                    {item.notes && <div className="mt-0.5 italic">&ldquo;{item.notes}&rdquo;</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal for permanent deletion */}
      <ConfirmDialog
        isOpen={Boolean(purgeTargetId)}
        title="Permanently Delete Record?"
        message="This action will completely erase this entry from all history and cannot be undone."
        confirmLabel="Erase Permanently"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={() => {
          if (purgeTargetId) {
            deletePermanently(purgeTargetId);
            setPurgeTargetId(null);
          }
        }}
        onCancel={() => setPurgeTargetId(null)}
      />
    </div>
  );
};
