import { 
  format, 
  parseISO, 
  startOfDay, 
  endOfDay, 
  subDays, 
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday as isTodayFns,
  parse,
  isValid,
  differenceInDays,
  addWeeks,
  subWeeks
} from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

export function formatDateKorean(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy년 M월 d일 (EEEEEE)', { locale: ko });
}

// 한국 시간대(KST)로 현재 날짜를 가져오는 헬퍼 함수
function getKoreanTime(): Date {
  const now = new Date();
  // UTC+9 시간대로 조정
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (9 * 3600000));
  return kst;
}

export function getTodayString(): string {
  return format(getKoreanTime(), 'yyyy-MM-dd');
}

export function getYesterdayString(): string {
  return format(subDays(getKoreanTime(), 1), 'yyyy-MM-dd');
}

export function getTomorrowString(): string {
  return format(addDays(getKoreanTime(), 1), 'yyyy-MM-dd');
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

// 달력 생성을 위한 유틸리티 함수들
export function generateCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // 일요일 시작
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = []
  let currentDate = calendarStart

  while (currentDate <= calendarEnd) {
    days.push(currentDate)
    currentDate = addDays(currentDate, 1)
  }

  return days
}

export function getWeekDayHeaders(): string[] {
  return ['일', '월', '화', '수', '목', '금', '토']
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}

export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1)
}

// 날짜 비교 유틸리티
export function isSameDateAs(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

export function isInSameMonth(date: Date, referenceDate: Date): boolean {
  return isSameMonth(date, referenceDate)
}

export function isDateToday(date: Date): boolean {
  return isTodayFns(date)
}

// 날짜 파싱 및 검증
export function parseDate(dateStr: string): Date | null {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date())
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

export function isValidDate(dateStr: string): boolean {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())
  return isValid(date)
}

export function dateToString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function stringToDate(dateStr: string): Date | null {
  return parseDate(dateStr)
}

// 기간 관련 유틸리티
export function getDaysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate)
}

export function getDateRangeArray(startDate: Date, endDate: Date): Date[] {
  const days = []
  let currentDate = startDate
  
  while (currentDate <= endDate) {
    days.push(currentDate)
    currentDate = addDays(currentDate, 1)
  }
  
  return days
}

export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate
}

// 사전 정의된 기간 옵션
export function getPresetDateRanges() {
  const today = new Date() // 일반 Date 객체 사용
  
  return {
    today: {
      label: '오늘',
      start: today,
      end: today
    },
    yesterday: {
      label: '어제',
      start: addDays(today, -1),
      end: addDays(today, -1)
    },
    last7Days: {
      label: '지난 7일',
      start: addDays(today, -6),
      end: today
    },
    last30Days: {
      label: '지난 30일',
      start: addDays(today, -29),
      end: today
    },
    thisWeek: {
      label: '이번 주',
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 })
    },
    lastWeek: {
      label: '지난 주',
      start: startOfWeek(addWeeks(today, -1), { weekStartsOn: 0 }),
      end: endOfWeek(addWeeks(today, -1), { weekStartsOn: 0 })
    },
    thisMonth: {
      label: '이번 달',
      start: startOfMonth(today),
      end: endOfMonth(today)
    },
    lastMonth: {
      label: '지난 달',
      start: startOfMonth(addMonths(today, -1)),
      end: endOfMonth(addMonths(today, -1))
    }
  }
}

// 캐시 방지를 위한 유니크 키 생성
export function getDateCacheKey(date?: string): string {
  const targetDate = date || getTodayString();
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)); // 5분마다 갱신
  return `${targetDate}_${timestamp}`;
}

// 실시간 날짜 확인 (자정 넘어갔는지 체크)
export function hasDateChanged(lastDate: string): boolean {
  return lastDate !== getTodayString();
}

// date-fns 함수들을 다시 export (다른 파일에서 사용하기 위해)
export { 
  addDays, 
  subDays, 
  format, 
  parseISO, 
  parse, 
  isValid,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  differenceInDays,
  addWeeks,
  subWeeks
} from 'date-fns';