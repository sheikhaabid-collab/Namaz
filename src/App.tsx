/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PrayerProvider, usePrayer } from './context/PrayerContext';
import { Header } from './components/common/Header';
import { BottomNavigation } from './components/common/BottomNavigation';
import { Toast } from './components/common/Toast';
import { HomeDashboard } from './components/home/HomeDashboard';
import { CalendarView } from './components/calendar/CalendarView';
import { QadaListScreen } from './components/qada/QadaListScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { PRAYER_NAMES, PrayerName } from './types/prayer';
import { triggerPrayerNotification } from './services/notifications';

function MainApp() {
  const { activeTab, setActiveTab, toast, dismissToast, settings } = usePrayer();
  const [lastNotifiedMinute, setLastNotifiedMinute] = useState<string>('');

  // Background prayer reminder checker
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      if (timeStr === lastNotifiedMinute) return;

      // Check each prayer
      PRAYER_NAMES.forEach((prayer: PrayerName) => {
        const config = settings.reminderTimes?.[prayer];
        if (config?.enabled && config.time === timeStr) {
          triggerPrayerNotification(
            prayer,
            `It is now time for ${prayer} Salah. Remember Allah and fulfill your prayer with peace.`,
            settings.soundEnabled
          );
          setLastNotifiedMinute(timeStr);
        }
      });
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [settings, lastNotifiedMinute]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarView />;
      case 'qada':
        return <QadaListScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen onBack={() => setActiveTab('home')} />;
      case 'home':
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header onOpenSettings={() => setActiveTab('settings')} />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-x-hidden">
        {renderActiveTab()}
      </main>

      {/* Persistent Bottom Tab Navigation (hidden when in settings for clean focus) */}
      {activeTab !== 'settings' && (
        <BottomNavigation
          currentTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Floating Global Toast (Supports Undo) */}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <PrayerProvider>
      <MainApp />
    </PrayerProvider>
  );
}
