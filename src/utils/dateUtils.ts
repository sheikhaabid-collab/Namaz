/**
 * Date utility functions for QadaMate
 * Uses local calendar calculations to prevent timezone offset discrepancies.
 */

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateToKey(now);
}

export function formatDateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to prevent DST shift
}

export function formatReadableDate(dateKey: string): string {
  try {
    const date = parseDateKey(dateKey);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateKey;
  }
}

export function formatShortDate(dateKey: string): string {
  try {
    const date = parseDateKey(dateKey);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateKey;
  }
}

export function formatDateTime(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}

export function getHijriDate(dateKey: string): string {
  try {
    const date = parseDateKey(dateKey);
    // Use Intl islamic calendar
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date) + ' AH';
  } catch {
    return '';
  }
}

export function shiftDateDays(dateKey: string, deltaDays: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + deltaDays);
  return formatDateToKey(date);
}

export interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function getMonthCalendarDays(year: number, monthIndex: number): CalendarDay[] {
  const todayKey = getTodayDateString();
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  
  // Starting day of week: 0 for Sunday
  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();
  
  const days: CalendarDay[] = [];
  
  // Previous month trailing days
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(year, monthIndex - 1, d);
    const dateKey = formatDateToKey(prevDate);
    days.push({
      dateKey,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }
  
  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currDate = new Date(year, monthIndex, d);
    const dateKey = formatDateToKey(currDate);
    days.push({
      dateKey,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }
  
  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, monthIndex + 1, d);
    const dateKey = formatDateToKey(nextDate);
    days.push({
      dateKey,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }
  
  return days;
}
