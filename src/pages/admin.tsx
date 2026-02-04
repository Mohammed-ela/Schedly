import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Slot } from '@/lib/supabase'

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    title: '',
    max_bookings: 1
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/calendar')
        toast.error('Accès réservé aux administrateurs')
      }
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchSlots()
    }
  }, [isAdmin])

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('schedly_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching slots:', error)
    } else {
      setSlots(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.from('schedly_slots').insert({
      ...formData,
      created_by: user?.id
    })

    if (error) {
      toast.error('Erreur lors de la création du créneau')
      console.error(error)
    } else {
      toast.success('Créneau créé avec succès')
      setIsModalOpen(false)
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '10:00',
        title: '',
        max_bookings: 1
      })
      fetchSlots()
    }

    setSubmitting(false)
  }

  const handleDelete = async (slotId: string) => {
    setDeleting(slotId)

    // First delete all bookings for this slot
    await supabase
      .from('schedly_bookings')
      .delete()
      .eq('slot_id', slotId)

    // Then delete the slot
    const { error } = await supabase
      .from('schedly_slots')
      .delete()
      .eq('id', slotId)

    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Créneau supprimé')
      fetchSlots()
    }

    setDeleting(null)
  }

  if (authLoading || !isAdmin) {
    return (
      <Layout title="Admin - Schedly">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin - Schedly">
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600 mt-1">Gérez les créneaux de réservation</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              + Nouveau créneau
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : slots.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucun créneau créé</p>
              <Button onClick={() => setIsModalOpen(true)}>
                Créer un créneau
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {slots.map(slot => (
                <Card key={slot.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{slot.title}</p>
                      <p className="text-gray-600">
                        {format(new Date(slot.date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {slot.start_time} - {slot.end_time} • {slot.max_bookings} place{slot.max_bookings > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(slot.id)}
                      loading={deleting === slot.id}
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau créneau"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre"
            type="text"
            placeholder="Ex: Consultation"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Heure de début"
              type="time"
              value={formData.start_time}
              onChange={e => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
            <Input
              label="Heure de fin"
              type="time"
              value={formData.end_time}
              onChange={e => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>
          <Input
            label="Nombre de places"
            type="number"
            min="1"
            value={formData.max_bookings}
            onChange={e => setFormData({ ...formData, max_bookings: parseInt(e.target.value) })}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              Créer le créneau
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
