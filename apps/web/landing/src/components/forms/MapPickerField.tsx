'use client'

import 'leaflet/dist/leaflet.css'

import type { Map as LeafletMap, Marker } from 'leaflet'
import { MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Field } from '@/components/auth/fields'
import Modal from '@/components/ui/Modal'

export interface Coords {
  lat: number
  lng: number
}

// Kuwait City; where the map opens when nothing is picked yet
const HOME: Coords = { lat: 29.3759, lng: 47.9774 }

/** The map inside the dialog: a click (or dragging the pin) picks the spot. */
function Picker({
  start,
  onPick,
}: {
  start: Coords
  onPick: (coords: Coords) => void
}) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: LeafletMap | undefined
    let cancelled = false
    import('leaflet').then((L) => {
      if (cancelled || !container.current) return
      map = L.map(container.current, {
        center: [start.lat, start.lng],
        zoom: 13,
      })
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
      const pin = L.divIcon({
        className: '',
        iconSize: [0, 0],
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#15304D;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transform:translate(-50%,-50%)"></div>',
      })
      const marker: Marker = L.marker([start.lat, start.lng], {
        icon: pin,
        draggable: true,
      }).addTo(map)
      marker.on('dragend', () => onPick(marker.getLatLng()))
      map.on('click', (event) => {
        marker.setLatLng(event.latlng)
        onPick(event.latlng)
      })
    })
    return () => {
      cancelled = true
      map?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- built once per opening
  }, [])

  return <div ref={container} dir="ltr" className="h-90 w-full rounded-lg" />
}

/** A field that opens a map to mark where something is. */
export default function MapPickerField({
  label,
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  label: string
  placeholder: string
  value: Coords | null
  onChange: (coords: Coords) => void
  required?: boolean
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Coords | null>(null)

  return (
    <Field label={label} required={required} error={error}>
      <button
        type="button"
        aria-label={label}
        onClick={() => {
          setDraft(value)
          setOpen(true)
        }}
        className={`flex h-11.5 w-full items-center gap-2 rounded-lg border bg-white px-3 text-right text-sm tracking-[-0.408px] ${
          error ? 'border-[#D12121]' : 'border-line'
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${value ? 'text-ink' : 'text-[#979797]'}`}
        >
          {value ? 'تم تحديد الموقع على الخريطة' : placeholder}
        </span>
        <MapPin className="h-4.5 w-4.5 shrink-0 text-ink" strokeWidth={1.5} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="map-picker-title"
        className="max-w-160"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h2 id="map-picker-title" className="text-lg font-bold text-ink">
              {label}
            </h2>
            <p className="text-sm font-medium text-muted">
              اضغط على الخريطة أو اسحب العلامة لتحديد الموقع.
            </p>
          </div>
          <Picker start={value ?? HOME} onPick={setDraft} />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!draft}
              onClick={() => {
                if (draft) onChange({ lat: draft.lat, lng: draft.lng })
                setOpen(false)
              }}
              className="flex h-12 flex-1 items-center justify-center rounded-3xl bg-brand text-sm font-bold text-white transition hover:bg-brand-dark disabled:bg-[#A0A0A0]"
            >
              تأكيد الموقع
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white text-sm font-bold text-ink"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </Field>
  )
}
