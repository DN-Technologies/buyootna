import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'بيوتنا — منصة العقارات والخدمات الأولى في الكويت',
  description:
    'تطبيق بيوتنا يتيح لك البحث عن عقارات للبيع أو الإيجار أو البدل في الكويت، بالإضافة إلى تصفح وطلب خدمات الصيانة والمقاولات من شركات معتمدة.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
