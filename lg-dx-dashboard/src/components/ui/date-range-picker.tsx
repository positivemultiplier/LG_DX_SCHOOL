'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { 
  formatDate, 
  formatDateKorean, 
  parseDate, 
  dateToString,
  isValidDate,
  getPresetDateRanges,
  isValidDateRange
} from '@/lib/utils/date'

interface DateRange {
  start: Date
  end: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  calendarClassName?: string
  showPresets?: boolean
  presetClassName?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '기간을 선택하세요',
  disabled = false,
  className,
  calendarClassName,
  showPresets = true,
  presetClassName
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const presetRanges = getPresetDateRanges()

  // 선택된 기간이 변경될 때 input 값 업데이트
  React.useEffect(() => {
    if (value?.start && value?.end) {
      const startStr = formatDateKorean(value.start, 'M월 d일')
      const endStr = formatDateKorean(value.end, 'M월 d일')
      setInputValue(`${startStr} - ${endStr}`)
    } else {
      setInputValue('')
    }
  }, [value])

  // 외부 클릭시 닫기
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleRangeSelect = (range: { start: Date; end: Date } | undefined) => {
    if (range && range.start && range.end) {
      onChange?.(range as DateRange)
    }
  }

  const handlePresetSelect = (preset: { start: Date; end: Date }) => {
    onChange?.(preset)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
    setInputValue('')
  }

  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pr-20', className)}
          readOnly
          onClick={toggleCalendar}
        />
        
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={toggleCalendar}
            disabled={disabled}
          >
            <CalendarIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className={cn(
          'absolute z-50 mt-1 bg-popover border border-border rounded-md shadow-lg',
          'min-w-[320px]',
          calendarClassName
        )}>
          <div className="flex">
            {/* 프리셋 옵션 */}
            {showPresets && (
              <div className={cn(
                'border-r border-border p-3 w-40',
                presetClassName
              )}>
                <div className="text-sm font-medium mb-3">빠른 선택</div>
                <div className="space-y-2">
                  {Object.entries(presetRanges).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 달력 */}
            <div className="flex-1">
              <Calendar
                mode="range"
                selected={value}
                onSelect={handleRangeSelect}
                defaultMonth={value?.start}
              />
              
              {/* 선택된 범위 표시 */}
              {value?.start && value?.end && (
                <div className="p-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">선택된 기간</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDateKorean(value.start, 'M/d')} - {formatDateKorean(value.end, 'M/d')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {Math.ceil((value.end.getTime() - value.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}일
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

DateRangePicker.displayName = 'DateRangePicker'