import { Inter } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema Bomberos',
  description: 'Sistema de gestión de asistencias para Bomberos Voluntarios',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bomberos',
  },
  icons: {
    icon:  '/icons/icon-192x192.png',
    apple: '/icons/icon-180x180.png',
  }
}

export const viewport = {
  themeColor:   '#b91c1c',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.add('light');
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}