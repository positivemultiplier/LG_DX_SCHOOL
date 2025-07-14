'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils/cn'
import { 
  formatDate, 
  formatDateKorean, 
  parseDate, 
  dateToString,
  isValidDate 
} from '@/lib/utils/date'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  calendarClassName?: string
  format?: string
  displayFormat?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = '날짜를 선택하세요',
  disabled = false,
  className,
  calendarClassName,
  format = 'yyyy-MM-dd',
  displayFormat = 'yyyy년 M월 d일'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  // 선택된 날짜가 변경될 때 input 값 업데이트
  React.useEffect(() => {
    if (value) {
      setInputValue(formatDate(value, displayFormat))
    } else {
      setInputValue('')
    }
  }, [value, displayFormat])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    // 사용자가 직접 입력한 경우 날짜 파싱 시도
    if (inputValue && isValidDate(inputValue)) {
      const date = parseDate(inputValue)
      if (date) {
        onChange?.(date)
      }
    } else if (!inputValue) {
      onChange?.(undefined)
    }
  }

  const handleDateSelect = (date: Date | { start: Date; end: Date; } | undefined) => {
    if (date && !(date instanceof Date) && 'start' in date) {
      // range 모드인 경우 start 날짜를 사용
      onChange?.(date.start)
    } else {
      onChange?.(date as Date | undefined)
    }
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
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-20',
            className
          )}
          readOnly={false}
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
          'min-w-[280px]',
          calendarClassName
        )}>
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            defaultMonth={value}
          />
        </div>
      )}
    </div>
  )
}

DatePicker.displayName = 'DatePicker'