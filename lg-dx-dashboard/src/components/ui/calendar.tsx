'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import {
  generateCalendarDays,
  getWeekDayHeaders,
  getNextMonth,
  getPreviousMonth,
  formatDate,
  formatDateKorean,
  isSameDateAs,
  isInSameMonth,
  isDateToday
} from '@/lib/utils/date'

interface CalendarProps {
  mode?: 'single' | 'range'
  selected?: Date | { start: Date; end: Date }
  onSelect?: (date: Date | { start: Date; end: Date } | undefined) => void
  defaultMonth?: Date
  disabled?: (date: Date) => boolean
  className?: string
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  defaultMonth = new Date(),
  disabled,
  className
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth)

  const calendarDays = generateCalendarDays(currentMonth)
  const weekHeaders = getWeekDayHeaders()

  const handlePreviousMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth))
  }

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth))
  }

  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return

    if (mode === 'single') {
      onSelect?.(date)
    } else if (mode === 'range') {
      const rangeSelected = selected as { start: Date; end: Date } | undefined
      
      if (!rangeSelected || (rangeSelected.start && rangeSelected.end)) {
        // 새로운 범위 시작
        onSelect?.({ start: date, end: date })
      } else if (rangeSelected.start && !rangeSelected.end) {
        // 범위 끝 설정
        if (date >= rangeSelected.start) {
          onSelect?.({ start: rangeSelected.start, end: date })
        } else {
          onSelect?.({ start: date, end: rangeSelected.start })
        }
      }
    }
  }

  const isDateSelected = (date: Date): boolean => {
    if (!selected) return false

    if (mode === 'single') {
      return isSameDateAs(date, selected as Date)
    } else {
      const rangeSelected = selected as { start: Date; end: Date }
      if (!rangeSelected.start) return false
      
      if (rangeSelected.end) {
        return date >= rangeSelected.start && date <= rangeSelected.end
      } else {
        return isSameDateAs(date, rangeSelected.start)
      }
    }
  }

  const isDateInRange = (date: Date): boolean => {
    if (mode !== 'range' || !selected) return false
    
    const rangeSelected = selected as { start: Date; end: Date }
    if (!rangeSelected.start || !rangeSelected.end) return false
    
    return date > rangeSelected.start && date < rangeSelected.end
  }

  const isRangeStart = (date: Date): boolean => {
    if (mode !== 'range' || !selected) return false
    const rangeSelected = selected as { start: Date; end: Date }
    return rangeSelected.start && isSameDateAs(date, rangeSelected.start)
  }

  const isRangeEnd = (date: Date): boolean => {
    if (mode !== 'range' || !selected) return false
    const rangeSelected = selected as { start: Date; end: Date }
    return rangeSelected.end && isSameDateAs(date, rangeSelected.end)
  }

  return (
    <div className={cn('p-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-sm font-semibold">
          {formatDateKorean(currentMonth, 'yyyy년 M월')}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekHeaders.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isCurrentMonth = isInSameMonth(date, currentMonth)
          const isSelected = isDateSelected(date)
          const isToday = isDateToday(date)
          const isDisabled = disabled && disabled(date)
          const inRange = isDateInRange(date)
          const rangeStart = isRangeStart(date)
          const rangeEnd = isRangeEnd(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                'h-8 w-8 text-xs rounded-md transition-colors relative',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-30',
                !isCurrentMonth && 'text-muted-foreground',
                isToday && 'bg-accent text-accent-foreground font-semibold',
                isSelected && mode === 'single' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                (rangeStart || rangeEnd) && 'bg-primary text-primary-foreground',
                inRange && 'bg-accent text-accent-foreground',
                isDisabled && 'text-muted-foreground cursor-not-allowed'
              )}
            >
              {formatDate(date, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = 'Calendar'