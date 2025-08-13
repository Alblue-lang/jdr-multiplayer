import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import Navigation from '@/components/Navigation/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JDR Multiplayer - Jeu de Rôle Multijoueur',
  description: 'Plateforme complète pour créer et gérer des parties de jeu de rôle multijoueur avec chat, système de dés, calendrier et classements.',
  keywords: ['jdr', 'jeu de rôle', 'multiplayer', 'rpg', 'tabletop', 'dice', 'campaign'],
  authors: [{ name: 'JDR Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
                <Toaster />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
