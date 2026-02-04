import { ReactNode } from 'react'
import Head from 'next/head'
import { Navbar } from './Navbar'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export function Layout({ children, title = 'Schedly' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Application de réservation de créneaux" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            © 2026 Schedly. Tous droits réservés.
          </div>
        </footer>
      </div>
    </>
  )
}
