import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema Bomberos',
  description: 'Sistema de asistencias para bomberos voluntarios',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#b01e1e',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#f4f7fc]`}>
        <div className="max-w-lg mx-auto min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}