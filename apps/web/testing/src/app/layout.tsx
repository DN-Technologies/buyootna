import type { Metadata, Viewport } from 'next'
import './globals.css'
import PwaRegister from '@/components/PwaRegister'

export const metadata: Metadata = {
  title: 'Buyootna · الاختبار',
  description: 'حالة منصة بيوتنا ومقاييسها وسجلاتها لفريق الاختبار',
  applicationName: 'Buyootna Testing',
  appleWebApp: { capable: true, title: 'Buyootna Testing', statusBarStyle: 'black-translucent' },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a1118',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
