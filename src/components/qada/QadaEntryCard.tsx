import React, { useState } from 'react';
import { QadaRecord, PRAYER_DETAILS } from '../../types/prayer';
import { formatReadableDate, formatShortDate, formatDateTime } from '../../utils/dateUtils';
import { PrayerIcon } from '../common/PrayerIcon';
import { Check, Edit3, Trash2, Calendar, FileText, Clock } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface QadaEntryCardProps {
  entry: QadaRecord;
  onComplete: (id: string) => void;
  onEdit: (entry: QadaRecord) => void;
  onRemove: (id: string) => void;
}

export const QadaEntryCard: React.FC<QadaEntryCardProps> = ({
  entry,
  onComplete,
  onEdit,
  onRemove,
}) => {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const prayerInfo = PRAYER_DETAILS[entry.prayer];
  const formattedMissedDate = formatReadableDate(entry.missedDate);
  const formattedCreated = formatDateTime(entry.createdAt);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3">
      {/* Top row: Prayer, Arabic badge, Action icons */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <PrayerIcon prayer={entry.prayer} size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {entry.prayer} Salah
              </h4>
              <span className="font-arabic text-sm text-slate-400 dark:text-slate-500">
                {prayerInfo.arabic}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {prayerInfo.rakats} • Missed on {formatShortDate(entry.missedDate)}
            </p>
          </div>
        </div>

        {/* Small icon actions for Edit & Remove */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit this entry"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Remove entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta details */}
      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-700 dark:text-slate-300">Missed Date:</strong>{' '}
            {formattedMissedDate}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Recorded: {formattedCreated}</span>
        </div>
        {entry.notes && (
          <div className="flex items-start gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="italic leading-snug">&ldquo;{entry.notes}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Prominent "Mark as Completed ✓" button */}
      <button
        onClick={() => setShowCompleteConfirm(true)}
        className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-2xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
      >
        <Check className="w-4 h-4 stroke-[2.5]" />
        Mark as Completed ✓
      </button>

      {/* Confirmation Dialog for Completion */}
      <ConfirmDialog
        isOpen={showCompleteConfirm}
        title="Mark Prayer as Completed?"
        message={`Have you completed making up the ${entry.prayer} Salah originally missed on ${formattedMissedDate}?`}
        confirmLabel="Yes, Mark Completed ✓"
        cancelLabel="Not Yet"
        variant="success"
        onConfirm={() => {
          setShowCompleteConfirm(false);
          onComplete(entry.id);
        }}
        onCancel={() => setShowCompleteConfirm(false)}
      />

      {/* Confirmation Dialog for Removal */}
      <ConfirmDialog
        isOpen={showRemoveConfirm}
        title="Remove Qada Entry?"
        message={`Are you sure you want to remove this ${entry.prayer} Qada entry from your list without marking it as completed?`}
        confirmLabel="Remove Entry"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowRemoveConfirm(false);
          onRemove(entry.id);
        }}
        onCancel={() => setShowRemoveConfirm(false)}
      />
    </div>
  );
};
