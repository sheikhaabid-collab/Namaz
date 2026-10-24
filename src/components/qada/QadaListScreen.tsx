import React, { useMemo, useState } from 'react';
import { usePrayer } from '../../context/PrayerContext';
import { PrayerName, PRAYER_NAMES, QadaRecord } from '../../types/prayer';
import { QadaEntryCard } from './QadaEntryCard';
import { AddQadaDialog } from './AddQadaDialog';
import { EditQadaDialog } from './EditQadaDialog';
import { PrayerIcon } from '../common/PrayerIcon';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const QadaListScreen: React.FC = () => {
  const {
    qadaRecords,
    completeQada,
    removeQada,
    editQada,
    addQada,
    totalOutstanding,
    outstandingByPrayer,
    setActiveTab,
  } = usePrayer();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<QadaRecord | null>(null);

  // Filter & Sort states
  const [selectedFilter, setSelectedFilter] = useState<'All' | PrayerName>('All');
  const [sortOption, setSortOption] = useState<'oldest' | 'newest' | 'prayer'>('oldest');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered and sorted outstanding entries
  const displayedEntries = useMemo(() => {
    // 1. Only outstanding
    let list = qadaRecords.filter((r) => r.status === 'outstanding');

    // 2. Prayer Filter
    if (selectedFilter !== 'All') {
      list = list.filter((r) => r.prayer === selectedFilter);
    }

    // 3. Search Query (prayer, date, or notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.prayer.toLowerCase().includes(q) ||
          r.missedDate.includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    list = [...list].sort((a, b) => {
      if (sortOption === 'oldest') {
        // Missed date ascending (oldest missed first)
        return a.missedDate.localeCompare(b.missedDate);
      } else if (sortOption === 'newest') {
        // Missed date descending (newest missed first)
        return b.missedDate.localeCompare(a.missedDate);
      } else {
        // By Prayer order (Fajr -> Isha)
        const orderA = PRAYER_NAMES.indexOf(a.prayer);
        const orderB = PRAYER_NAMES.indexOf(b.prayer);
        return orderA - orderB;
      }
    });

    return list;
  }, [qadaRecords, selectedFilter, searchQuery, sortOption]);

  return (
    <div className="pb-28 pt-3 max-w-md mx-auto px-4 space-y-5">
      {/* Dynamic Live Counter Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300">
              Outstanding Balance
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              My Qada Prayers
            </h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-amber-300">
              {totalOutstanding}
            </span>
            <p className="text-[11px] text-emerald-200/80">Total to Make Up</p>
          </div>
        </div>

        {/* Breakdown by each prayer */}
        <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-emerald-800/80">
          {PRAYER_NAMES.map((p) => {
            const count = outstandingByPrayer[p] || 0;
            const isCurrentFilter = selectedFilter === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedFilter(isCurrentFilter ? 'All' : p)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isCurrentFilter
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-bold scale-102'
                    : 'bg-emerald-800/50 hover:bg-emerald-800 text-white border border-emerald-700/50'
                }`}
              >
                <PrayerIcon
                  prayer={p}
                  size={16}
                  className={isCurrentFilter ? 'text-slate-900' : 'text-emerald-200'}
                />
                <span className="text-xs font-semibold mt-1">{p}</span>
                <span
                  className={`text-sm font-extrabold ${
                    isCurrentFilter ? 'text-slate-950' : 'text-amber-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by date (YYYY-MM-DD), prayer or note..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter chips & Sort dropdown */}
        <div className="flex items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-1">
            <button
              onClick={() => setSelectedFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === 'All'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              All ({totalOutstanding})
            </button>
            {PRAYER_NAMES.map((p) => {
              const count = outstandingByPrayer[p] || 0;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedFilter(p)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedFilter === p
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'oldest' | 'newest' | 'prayer')}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-1.5 pl-7 pr-6 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-xs"
            >
              <option value="oldest">Oldest first</option>
              <option value="newest">Newest first</option>
              <option value="prayer">Prayer name</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* List of Outstanding Entries */}
      <div className="space-y-3">
        {displayedEntries.length === 0 ? (
          /* Empty state */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 text-center space-y-3 my-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              {totalOutstanding === 0 ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Filter className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {totalOutstanding === 0
                  ? 'Alhamdulillah! No Outstanding Qada'
                  : 'No Matching Qada Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                {totalOutstanding === 0
                  ? 'All recorded prayers are fulfilled. If you miss a prayer in the future, tap the + button below to add it.'
                  : 'Try adjusting your search query or prayer filters.'}
              </p>
            </div>
            {totalOutstanding === 0 && (
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add a Missed Prayer
                </button>
              </div>
            )}
          </div>
        ) : (
          displayedEntries.map((entry) => (
            <QadaEntryCard
              key={entry.id}
              entry={entry}
              onComplete={completeQada}
              onEdit={(rec) => setEditingEntry(rec)}
              onRemove={removeQada}
            />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all focus:outline-hidden ring-4 ring-emerald-600/30"
        aria-label="Add Missed Prayer"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Add Qada Dialog */}
      <AddQadaDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={(prayer, date, notes) => {
          addQada(prayer, date, notes);
        }}
      />

      {/* Edit Qada Dialog */}
      <EditQadaDialog
        isOpen={Boolean(editingEntry)}
        record={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={(id, updates) => {
          editQada(id, updates);
        }}
      />
    </div>
  );
};
