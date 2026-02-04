import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <Layout title="Schedly - Réservation de créneaux">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Réservation simplifiée
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Réservez vos créneaux avec{' '}
            <span className="text-primary-600">Schedly</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Une application simple et intuitive pour gérer vos réservations.
            Consultez le calendrier, choisissez votre créneau, réservez en un clic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/calendar">
                <Button size="lg">Voir le calendrier</Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg">Commencer</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">Se connecter</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Consultez le calendrier</h3>
              <p className="text-gray-600">Parcourez les dates disponibles et visualisez les créneaux ouverts.</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Choisissez votre créneau</h3>
              <p className="text-gray-600">Sélectionnez le créneau qui vous convient parmi ceux disponibles.</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Réservez en un clic</h3>
              <p className="text-gray-600">Confirmez votre réservation instantanément. Annulez si besoin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à réserver ?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Créez votre compte gratuitement et commencez à réserver dès maintenant.
          </p>
          <Link href={user ? '/calendar' : '/register'}>
            <button className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg">
              {user ? 'Voir le calendrier' : 'Créer un compte'}
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
