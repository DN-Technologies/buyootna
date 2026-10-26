'use client'

import { useEffect, useState } from 'react'
import { Download, Share } from 'lucide-react'
import { Card } from './ui'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * «تثبيت التطبيق»: Android/Chrome get a button (the browser's install
 * prompt); iPhone gets the Share → «إضافة إلى الشاشة الرئيسية» steps, as
 * Safari has no prompt. Hidden once the portal runs installed.
 */
export default function InstallCard() {
  const [installed, setInstalled] = useState(true)
  const [isIos, setIsIos] = useState(false)
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent))
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || (!isIos && !prompt)) return null

  return (
    <Card>
      <h2 className="font-bold">تثبيت التطبيق</h2>
      <p className="mt-0.5 text-xs text-muted">افتح البوابة من الشاشة الرئيسية كتطبيق، بملء الشاشة.</p>
      {isIos ? (
        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm">
          في Safari اضغط
          <Share className="inline h-4 w-4 text-accent" />
          مشاركة، ثم «إضافة إلى الشاشة الرئيسية».
        </p>
      ) : (
        <button
          onClick={async () => {
            await prompt?.prompt()
            const choice = await prompt?.userChoice
            if (choice?.outcome === 'accepted') setInstalled(true)
            setPrompt(null)
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 font-bold text-primary"
        >
          <Download className="h-4 w-4" />
          تثبيت
        </button>
      )}
    </Card>
  )
}
