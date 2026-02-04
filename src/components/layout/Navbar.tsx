import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { user, isAdmin, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900">Schedly</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/calendar"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Calendrier
                </Link>
                <Link
                  href="/my-bookings"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Mes réservations
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                {isAdmin && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                    Admin
                  </span>
                )}
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
