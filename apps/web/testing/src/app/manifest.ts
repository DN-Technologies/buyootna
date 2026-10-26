import type { MetadataRoute } from 'next'

/** «إضافة إلى الشاشة الرئيسية»: opens full screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Buyootna Testing',
    short_name: 'Testing',
    description: 'حالة منصة بيوتنا ومقاييسها وسجلاتها لفريق الاختبار',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#0a1118',
    theme_color: '#0a1118',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android crops it to its own shape; the logo sits in the safe zone
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
