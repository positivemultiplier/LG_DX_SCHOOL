import { useEffect, useState } from 'react';
import { getTodayString, hasDateChanged } from '@/lib/utils/date';

/**
 * 실시간 날짜 업데이트를 감지하는 훅
 * 자정이 넘어갔을 때 onDateChange 콜백을 호출합니다.
 */
export function useDateUpdate(onDateChange?: (newDate: string) => void) {
  const [currentDate, setCurrentDate] = useState(getTodayString());

  useEffect(() => {
    // 1분마다 날짜 변경 확인
    const interval = setInterval(() => {
      const today = getTodayString();
      
      if (hasDateChanged(currentDate)) {
        setCurrentDate(today);
        onDateChange?.(today);
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(interval);
  }, [currentDate, onDateChange]);

  return {
    currentDate,
    isToday: (date: string) => date === currentDate
  };
}

/**
 * 페이지가 "오늘" 모드일 때 자동으로 날짜를 업데이트하는 훅
 */
export function useAutoDateUpdate(
  selectedDate: string,
  onDateChange: (newDate: string) => void,
  enabled: boolean = true
) {
  useDateUpdate((newDate) => {
    // 현재 선택된 날짜가 "오늘"이고, 실제 오늘 날짜가 변경되었을 때만 업데이트
    if (enabled && selectedDate === getTodayString()) {
      onDateChange(newDate);
    }
  });
}