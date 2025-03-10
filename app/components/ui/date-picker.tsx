'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  minDate?: Date
}

export function DatePicker ({ selected, onSelect, minDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selected ? format(selected, 'PPP') : <span>Tarih seçin</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selected}
          onSelect={onSelect}
          initialFocus
          disabled={date => (minDate ? date < minDate : date < new Date())}
        />
      </PopoverContent>
    </Popover>
  )
}
