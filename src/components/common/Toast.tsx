import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X, RotateCcw } from 'lucide-react';
import { ToastInfo } from '../../context/PrayerContext';

interface ToastProps {
  toast: ToastInfo | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="pointer-events-auto bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl p-3.5 flex items-center justify-between gap-3 border border-slate-800 dark:border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
          {getIcon()}
          <span className="text-sm font-medium leading-tight truncate">
            {toast.message}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {toast.undoLabel && toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo?.();
                onDismiss();
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {toast.undoLabel}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
