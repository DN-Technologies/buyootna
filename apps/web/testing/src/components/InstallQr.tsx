'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** A link and its QR code, to open a test build on another phone. */
export default function InstallQr({ label, url }: { label: string; url: string }) {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 240 })
      .then(setImage)
      .catch(() => setImage(null))
  }, [url])

  return (
    <div className="flex items-center gap-3 rounded-xl bg-primary p-3">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={`QR ${label}`} className="size-24 rounded-lg bg-white p-1" />
      )}
      <div className="min-w-0">
        <p className="font-semibold">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-accent" dir="ltr">
          {url}
        </a>
      </div>
    </div>
  )
}
