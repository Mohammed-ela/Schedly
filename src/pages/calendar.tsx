import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/Layout'
import { Calendar } from '@/components/calendar/Calendar'
import { SlotList } from '@/components/calendar/SlotList'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Slot } from '@/lib/supabase'

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('schedly_slots')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching slots:', error)
    } else {
      setSlots(data || [])
    }
    setLoading(false)
  }

  if (authLoading || !user) {
    return (
      <Layout title="Calendrier - Schedly">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Calendrier - Schedly">
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
            <p className="text-gray-600 mt-1">Sélectionnez une date pour voir les créneaux disponibles</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <Calendar
                slots={slots}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
              />
              <SlotList
                selectedDate={selectedDate}
                slots={slots}
                onBookingChange={fetchSlots}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
