import { format, parseISO, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

export function formatDateKorean(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy년 M월 d일 (EEEEEE)', { locale: ko });
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYesterdayString(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

export function getTomorrowString(): string {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = subDays(end, days - 1);
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  };
}

export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }
  return dates;
}