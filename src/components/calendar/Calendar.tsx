import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Slot } from '@/lib/supabase'

interface CalendarProps {
  slots: Slot[]
  onSelectDate: (date: Date) => void
  selectedDate: Date | null
}

export function Calendar({ slots, onSelectDate, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfMonth = monthStart.getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const getSlotsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return slots.filter(slot => slot.date === dateStr)
  }

  const isPastDay = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14" />
        ))}

        {days.map(day => {
          const daySlots = getSlotsForDay(day)
          const hasSlots = daySlots.length > 0
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isPast = isPastDay(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && onSelectDate(day)}
              disabled={isPast}
              className={`
                h-14 rounded-lg flex flex-col items-center justify-center relative transition-all
                ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                ${isToday(day) ? 'font-bold' : ''}
                ${isSelected ? 'bg-primary-600 text-white' : ''}
                ${!isSelected && hasSlots && !isPast ? 'bg-primary-50 hover:bg-primary-100' : ''}
                ${!isSelected && !hasSlots && !isPast ? 'hover:bg-gray-100' : ''}
                ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className={isSelected ? 'text-white' : ''}>{format(day, 'd')}</span>
              {hasSlots && !isPast && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span>Créneaux disponibles</span>
        </div>
      </div>
    </div>
  )
}
