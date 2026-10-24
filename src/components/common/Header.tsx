import React from 'react';
import { Settings, Moon, Sun, Bell, BellOff } from 'lucide-react';
import { usePrayer } from '../../context/PrayerContext';
import { isNotificationSupported, requestNotificationPermission } from '../../services/notifications';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { settings, updateSettings, showToast } = usePrayer();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      showToast({
        type: 'info',
        message: 'Push notifications are not supported on this browser.',
      });
      return;
    }

    if (!settings.notificationsEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        updateSettings({ notificationsEnabled: true });
        showToast({
          type: 'success',
          message: 'Prayer reminders enabled.',
        });
      } else {
        showToast({
          type: 'warning',
          message: 'Notification permission was denied in your browser settings.',
        });
      }
    } else {
      updateSettings({ notificationsEnabled: false });
      showToast({
        type: 'info',
        message: 'Prayer reminders paused.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-900/95 dark:bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title & Islamic Monogram */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-500/30 flex items-center justify-center shadow-inner text-amber-300 font-arabic text-xl font-bold">
            ق
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">
                QadaMate
              </h1>
              <span className="text-xs font-serif font-arabic text-amber-300/90 tracking-normal">
                قضاء نماز
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-normal leading-tight">
              Salah & Qada Companion
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleNotifications}
            aria-label="Toggle notifications"
            className={`p-2 rounded-xl transition-colors ${
              settings.notificationsEnabled
                ? 'text-amber-300 bg-emerald-800/80'
                : 'text-emerald-200/70 hover:text-white hover:bg-emerald-800/40'
            }`}
            title={settings.notificationsEnabled ? 'Reminders active' : 'Turn on reminders'}
          >
            {settings.notificationsEnabled ? (
              <Bell className="w-4 h-4 fill-amber-300/30" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-emerald-200/70 hover:text-white hover:bg-emerald-800/40 transition-colors"
            title="Toggle dark/light mode"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-xl text-emerald-200/70 hover:text-white hover:bg-emerald-800/40 transition-colors"
            title="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
