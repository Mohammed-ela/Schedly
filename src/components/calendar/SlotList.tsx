import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase, Slot, Booking } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface SlotListProps {
  selectedDate: Date | null
  slots: Slot[]
  onBookingChange: () => void
}

export function SlotList({ selectedDate, slots, onBookingChange }: SlotListProps) {
  const { user, profile } = useAuth()
  const [bookings, setBookings] = useState<Record<string, number>>({})
  const [userBookings, setUserBookings] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  const dateSlots = selectedDate
    ? slots.filter(slot => slot.date === format(selectedDate, 'yyyy-MM-dd'))
    : []

  useEffect(() => {
    if (dateSlots.length > 0) {
      fetchBookingsCount()
    }
  }, [selectedDate, slots])

  const fetchBookingsCount = async () => {
    const slotIds = dateSlots.map(s => s.id)

    // Get booking counts
    const { data: bookingData } = await supabase
      .from('schedly_bookings')
      .select('slot_id')
      .in('slot_id', slotIds)
      .eq('status', 'confirmed')

    const counts: Record<string, number> = {}
    bookingData?.forEach(b => {
      counts[b.slot_id] = (counts[b.slot_id] || 0) + 1
    })
    setBookings(counts)

    // Get user's bookings
    if (user) {
      const { data: userBookingData } = await supabase
        .from('schedly_bookings')
        .select('slot_id')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .in('slot_id', slotIds)

      setUserBookings(userBookingData?.map(b => b.slot_id) || [])
    }
  }

  const handleBook = async (slot: Slot) => {
    if (!user || !profile) {
      toast.error('Vous devez être connecté')
      return
    }

    setLoading(slot.id)

    // Check if already booked
    const { data: existing } = await supabase
      .from('schedly_bookings')
      .select('id')
      .eq('slot_id', slot.id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single()

    if (existing) {
      toast.error('Vous avez déjà réservé ce créneau')
      setLoading(null)
      return
    }

    // Check availability
    const currentCount = bookings[slot.id] || 0
    if (currentCount >= slot.max_bookings) {
      toast.error('Ce créneau est complet')
      setLoading(null)
      return
    }

    // Create booking
    const { error } = await supabase.from('schedly_bookings').insert({
      slot_id: slot.id,
      user_id: user.id,
      user_email: user.email,
      user_name: profile.full_name,
      status: 'confirmed'
    })

    if (error) {
      toast.error('Erreur lors de la réservation')
      console.error(error)
    } else {
      toast.success('Réservation confirmée !')
      onBookingChange()
      fetchBookingsCount()
    }

    setLoading(null)
  }

  const handleCancel = async (slot: Slot) => {
    if (!user) return

    setLoading(slot.id)

    const { error } = await supabase
      .from('schedly_bookings')
      .update({ status: 'cancelled' })
      .eq('slot_id', slot.id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')

    if (error) {
      toast.error('Erreur lors de l\'annulation')
    } else {
      toast.success('Réservation annulée')
      onBookingChange()
      fetchBookingsCount()
    }

    setLoading(null)
  }

  if (!selectedDate) {
    return (
      <Card className="text-center py-12">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">Sélectionnez une date pour voir les créneaux disponibles</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Créneaux du {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
      </h3>

      {dateSlots.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucun créneau disponible pour cette date</p>
      ) : (
        <div className="space-y-3">
          {dateSlots.map(slot => {
            const currentBookings = bookings[slot.id] || 0
            const isFull = currentBookings >= slot.max_bookings
            const isBooked = userBookings.includes(slot.id)
            const available = slot.max_bookings - currentBookings

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-lg border ${isBooked ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{slot.title}</p>
                    <p className="text-sm text-gray-500">
                      {slot.start_time} - {slot.end_time}
                    </p>
                    <p className={`text-sm ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                      {isFull ? 'Complet' : `${available} place${available > 1 ? 's' : ''} disponible${available > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {user && (
                    <div>
                      {isBooked ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancel(slot)}
                          loading={loading === slot.id}
                        >
                          Annuler
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleBook(slot)}
                          disabled={isFull}
                          loading={loading === slot.id}
                        >
                          Réserver
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
