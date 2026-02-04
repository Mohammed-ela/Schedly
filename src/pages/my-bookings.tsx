import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Booking, Slot } from '@/lib/supabase'

type BookingWithSlot = Booking & { slot: Slot }

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('schedly_bookings')
      .select(`
        *,
        slot:schedly_slots(*)
      `)
      .eq('user_id', user?.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
    } else {
      setBookings(data as BookingWithSlot[] || [])
    }
    setLoading(false)
  }

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId)

    const { error } = await supabase
      .from('schedly_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      toast.error('Erreur lors de l\'annulation')
    } else {
      toast.success('Réservation annulée')
      fetchBookings()
    }

    setCancelling(null)
  }

  const isPast = (date: string) => {
    return new Date(date) < new Date(new Date().toDateString())
  }

  if (authLoading || !user) {
    return (
      <Layout title="Mes réservations - Schedly">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Mes réservations - Schedly">
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mes réservations</h1>
            <p className="text-gray-600 mt-1">Consultez et gérez vos réservations</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : bookings.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-4">Vous n'avez aucune réservation</p>
              <Button onClick={() => router.push('/calendar')}>
                Voir le calendrier
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <Card key={booking.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.slot.title}</p>
                      <p className="text-gray-600">
                        {format(new Date(booking.slot.date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.slot.start_time} - {booking.slot.end_time}
                      </p>
                    </div>
                    <div className="text-right">
                      {isPast(booking.slot.date) ? (
                        <span className="text-sm text-gray-400">Passé</span>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancel(booking.id)}
                          loading={cancelling === booking.id}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
