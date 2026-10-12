/* eslint-disable @next/next/no-img-element -- listing photos are uploaded by
   advertisers to storage hosts the image optimizer isn't configured for */
'use client'

import 'leaflet/dist/leaflet.css'

import type { DivIcon, LayerGroup, Map as LeafletMap } from 'leaflet'
import { Building2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import AccountAction from '@/components/ui/AccountAction'
import { api } from '@/lib/api'
import {
  CATEGORY_LABELS,
  categoryCounts,
  LISTING_TYPES,
} from '@/lib/categories'
import { formatNumber } from '@/lib/format'
import type { ListingType, PropertyDetails } from '@/lib/types'

export interface MapFilters {
  type?: ListingType
  governorateIds: string[]
  areaIds: string[]
  categories: string[]
  minPrice?: string
  maxPrice?: string
  requestYear?: string
  requiredYear?: string
}

// The API's names for the three kinds of ad pin
const PIN_TYPES = { SALE: 'sell', RENT: 'rent', EXCHANGE: 'exchange' } as const
type PinType = (typeof PIN_TYPES)[ListingType]

interface Pin {
  id: string
  type: PinType
  priceLabel?: string
  lat: number
  lng: number
}

interface PinFeature {
  geometry: { coordinates: [number, number] }
  properties: { id: string; type: PinType; priceLabel?: string }
}

// Kuwait, where every ad is
const HOME: [number, number] = [29.33, 47.75]
const HOME_ZOOM = 10
// Pins closer than this on screen are shown as one numbered circle
const CLUSTER_PX = 70

const EMPTY_TEXT: Record<string, string> = {
  SALE: 'لا توجد عقارات للبيع في هذه المنطقة حالياً.',
  RENT: 'لا توجد عقارات للايجار في هذه المنطقة حالياً.',
  EXCHANGE: 'لا توجد عقارات للبدل في هذه المنطقة حالياً.',
  ALL: 'لا توجد عقارات في هذه المنطقة حالياً.',
}

const EXCHANGE_ARROWS =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>'

/** A price pill on a short stem, or "بدل" under its arrows for an exchange ad. */
function pinHtml(pin: Pin, selected: boolean): string {
  const pill = selected
    ? 'background:#B98A45;color:#fff'
    : 'background:#fff;color:#111'
  const base = `display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:11px;font:600 13px Cairo,sans-serif;white-space:nowrap;box-shadow:0 1px 3px rgba(33,37,41,.3);${pill}`
  if (pin.type === 'exchange') {
    return `<div style="display:flex;flex-direction:column;align-items:center;color:#15304D;transform:translate(-50%,-100%)">${EXCHANGE_ARROWS}<span style="${base}">بدل</span></div>`
  }
  const dot = selected ? '#B98A45' : '#15304D'
  return `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-6px)"><span style="width:8px;height:8px;border-radius:50%;background:${dot}"></span><span style="width:1.5px;height:8px;background:${dot}"></span><span dir="rtl" style="${base}">${pin.priceLabel ?? 'السعر غير معلن'}</span></div>`
}

const clusterHtml = (count: number) =>
  `<div style="display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#15304D;border:2px solid #fff;color:#fff;font:600 13px Cairo,sans-serif;transform:translate(-50%,-50%);box-shadow:0 1px 4px rgba(33,37,41,.35)">${count > 99 ? '99+' : count}</div>`

/** The card that opens over a chosen pin. */
function PinCard({
  property,
  onClose,
}: {
  property: PropertyDetails
  onClose: () => void
}) {
  const category = CATEGORY_LABELS[property.category] ?? 'عقار'
  const deal = LISTING_TYPES.find((type) => type.id === property.type)?.tab
  const counts = categoryCounts(property.category)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm leading-none text-white"
      >
        ×
      </button>
      <div
        dir="rtl"
        className="flex w-85.75 max-w-[calc(100vw-56px)] overflow-hidden rounded-md bg-white shadow-[0_4px_12px_rgba(33,37,41,0.25)]"
      >
        <Link
          href={`/properties/${property.id}`}
          className="relative w-29.25 shrink-0 bg-tag"
        >
          {property.images?.[0] && (
            <img
              src={property.images[0]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {property.isFeatured && (
            <span className="absolute top-2 right-2 flex h-5 items-center rounded-tl-[10px] rounded-tr-sm rounded-bl-[10px] bg-linear-to-l from-[#FF8D28] to-[#FACC15] px-2.5 text-xs text-ink">
              مميز
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-end gap-0.5 text-brand">
              {property.price !== null ? (
                <>
                  <span className="text-xl leading-none font-semibold">
                    {formatNumber(property.price)}
                  </span>
                  <span className="text-xs font-semibold">د.ك</span>
                </>
              ) : (
                <span className="text-sm font-semibold">السعر غير معلن</span>
              )}
            </p>
            <AccountAction aria-label="أضف إلى المفضلة" className="shrink-0">
              <Image
                src="/landing/detail-heart.svg"
                alt=""
                width={20}
                height={20}
              />
            </AccountAction>
          </div>
          <p className="truncate text-xs font-medium text-ink">
            {property.host.name}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-ink">
            <Link
              href={`/properties/${property.id}`}
              className="font-semibold hover:text-brand"
            >
              {[category, deal].filter(Boolean).join(' ')}
            </Link>
            {!!property.areaSize && (
              <span>• {formatNumber(property.areaSize)} م</span>
            )}
            {counts.rooms && !!property.beds && (
              <span className="flex items-center gap-1 border-r border-line pr-2">
                <Image
                  src="/landing/detail-bed.svg"
                  alt="غرف"
                  width={14}
                  height={14}
                  className="-scale-y-100"
                />
                {property.beds}
              </span>
            )}
            {counts.baths && !!property.baths && (
              <span className="flex items-center gap-1 border-r border-line pr-2">
                <Image
                  src="/landing/detail-bath.svg"
                  alt="حمام"
                  width={14}
                  height={14}
                  className="-scale-y-100"
                />
                {property.baths}
              </span>
            )}
          </p>
          <p className="flex items-center gap-1 text-xs font-medium text-muted">
            <Image
              src="/landing/card-location.svg"
              alt=""
              width={14}
              height={14}
            />
            <span className="truncate">{property.location}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * The results on a map: a pin per ad in view (close ones gathered into a
 * numbered circle), following the same filters as the list. Choosing a pin
 * opens a short card that leads to the ad.
 */
export default function PropertiesMap({
  filters,
  closeHref,
}: {
  filters: MapFilters
  // Back to the list
  closeHref: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<LeafletMap | null>(null)
  const layer = useRef<LayerGroup | null>(null)
  const leaflet = useRef<typeof import('leaflet') | null>(null)
  const pins = useRef<Pin[]>([])
  const selectedId = useRef<string | null>(null)
  const request = useRef(0)

  const [empty, setEmpty] = useState(false)
  const [selected, setSelected] = useState<{
    pin: Pin
    property?: PropertyDetails
  } | null>(null)
  const [cardAt, setCardAt] = useState<{ x: number; y: number } | null>(null)

  // Any filter change reloads the pins
  const filterKey = JSON.stringify(filters)

  const placeCard = useCallback(() => {
    const current = pins.current.find((pin) => pin.id === selectedId.current)
    if (!map.current || !current) return setCardAt(null)
    const point = map.current.latLngToContainerPoint([current.lat, current.lng])
    setCardAt({ x: point.x, y: point.y })
  }, [])

  const choose = useCallback(
    (pin: Pin | null) => {
      selectedId.current = pin?.id ?? null
      setSelected(pin ? { pin } : null)
      placeCard()
      if (!pin) return
      api
        .get<PropertyDetails>(`/properties/${pin.id}`)
        .then(({ data }) => {
          if (selectedId.current === pin.id)
            setSelected({ pin, property: data })
        })
        .catch(() => {})
    },
    [placeCard],
  )

  /** Redraws the pins for the current zoom, gathering close ones. */
  const draw = useCallback(() => {
    const L = leaflet.current
    if (!L || !map.current || !layer.current) return
    layer.current.clearLayers()

    const groups = new Map<string, Pin[]>()
    for (const pin of pins.current) {
      const point = map.current.latLngToLayerPoint([pin.lat, pin.lng])
      const key = `${Math.floor(point.x / CLUSTER_PX)}:${Math.floor(point.y / CLUSTER_PX)}`
      groups.set(key, [...(groups.get(key) ?? []), pin])
    }

    const icon = (html: string): DivIcon =>
      L.divIcon({ html, className: '', iconSize: [0, 0] })

    for (const group of groups.values()) {
      if (group.length === 1) {
        const pin = group[0]
        L.marker([pin.lat, pin.lng], {
          icon: icon(pinHtml(pin, pin.id === selectedId.current)),
          keyboard: false,
        })
          .on('click', () => {
            choose(pin)
            draw()
          })
          .addTo(layer.current)
        continue
      }
      const lat = group.reduce((sum, pin) => sum + pin.lat, 0) / group.length
      const lng = group.reduce((sum, pin) => sum + pin.lng, 0) / group.length
      L.marker([lat, lng], {
        icon: icon(clusterHtml(group.length)),
        keyboard: false,
      })
        // A circle opens up into its pins
        .on('click', () =>
          map.current?.setView([lat, lng], map.current.getZoom() + 2),
        )
        .addTo(layer.current)
    }
  }, [choose])

  /** Loads the pins inside the visible area. */
  const load = useCallback(async () => {
    if (!map.current) return
    const bounds = map.current.getBounds()
    const current = JSON.parse(filterKey) as MapFilters
    const types: PinType[] = current.type
      ? [PIN_TYPES[current.type]]
      : Object.values(PIN_TYPES)
    const ticket = ++request.current

    try {
      const responses = await Promise.all(
        types.map((type) =>
          api.get<{ features: PinFeature[] }>('/map/discover', {
            params: {
              ne_lat: bounds.getNorth(),
              ne_lng: bounds.getEast(),
              sw_lat: bounds.getSouth(),
              sw_lng: bounds.getWest(),
              type,
              governorateIds: current.governorateIds.join(',') || undefined,
              areaIds: current.areaIds.join(',') || undefined,
              category: current.categories.join(',') || undefined,
              minPrice: current.minPrice,
              maxPrice: current.maxPrice,
              requestYear:
                type === 'exchange' ? current.requestYear : undefined,
              requiredYear:
                type === 'exchange' ? current.requiredYear : undefined,
            },
          }),
        ),
      )
      // A newer move has already asked again
      if (ticket !== request.current) return
      pins.current = responses.flatMap(({ data }) =>
        (data.features ?? []).map((feature) => ({
          id: feature.properties.id,
          type: feature.properties.type,
          priceLabel: feature.properties.priceLabel,
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
        })),
      )
      setEmpty(pins.current.length === 0)
      draw()
      placeCard()
    } catch {
      // Keep whatever is drawn; the next move tries again
    }
  }, [draw, filterKey, placeCard])

  // The map itself, once
  useEffect(() => {
    let cancelled = false
    let created: LeafletMap | undefined

    import('leaflet').then((L) => {
      if (cancelled || !container.current) return
      leaflet.current = L
      created = L.map(container.current, {
        center: HOME,
        zoom: HOME_ZOOM,
        zoomControl: false,
        minZoom: 7,
      })
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(created)
      layer.current = L.layerGroup().addTo(created)
      map.current = created
      created.on('click', () => {
        choose(null)
        draw()
      })
      created.fire('moveend')
    })

    return () => {
      cancelled = true
      created?.remove()
      map.current = null
      layer.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- built once
  }, [])

  // Moving or zooming reloads, a short moment after the map settles
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onMoveEnd = () => {
      clearTimeout(timer)
      timer = setTimeout(load, 250)
    }
    const onMove = () => placeCard()

    // The map may not be built yet on the first run
    const attach = setInterval(() => {
      if (!map.current) return
      clearInterval(attach)
      map.current.on('moveend', onMoveEnd)
      map.current.on('move', onMove)
      load()
    }, 50)

    return () => {
      clearInterval(attach)
      clearTimeout(timer)
      map.current?.off('moveend', onMoveEnd)
      map.current?.off('move', onMove)
    }
  }, [load, placeCard])

  const zoomButton =
    'flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-[0_1px_3px_rgba(33,37,41,0.3)] transition hover:bg-surface'

  return (
    <div className="relative isolate h-141 w-full overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(33,37,41,0.16)]">
      {/* Maps read left to right whatever the page's direction */}
      <div ref={container} dir="ltr" className="absolute inset-0 z-0" />

      <Link
        href={closeHref}
        scroll={false}
        aria-label="إغلاق الخريطة"
        className="absolute top-5 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-[0_1px_3px_rgba(33,37,41,0.3)]"
      >
        <Image src="/landing/modal-close.svg" alt="" width={24} height={24} />
      </Link>

      {empty && (
        <p
          role="status"
          className="absolute top-6 right-6 z-10 flex max-w-[calc(100%-112px)] items-center gap-2 rounded-xl bg-surface px-4 py-3 text-[15px] font-medium text-ink shadow-[0_1px_3px_rgba(33,37,41,0.25)]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
            <Building2 className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </span>
          {EMPTY_TEXT[filters.type ?? 'ALL']}
        </p>
      )}

      <div className="absolute right-6 bottom-8 z-10 flex flex-col gap-2">
        <button
          type="button"
          aria-label="تكبير"
          onClick={() => map.current?.zoomIn()}
          className={zoomButton}
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="تصغير"
          onClick={() => map.current?.zoomOut()}
          className={zoomButton}
        >
          <Minus className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {selected?.property && cardAt && (
        <div
          className="absolute z-20 -translate-x-1/2"
          style={{
            // Below the pin, kept inside the map
            left: Math.min(
              Math.max(cardAt.x, 190),
              (container.current?.clientWidth ?? 800) - 190,
            ),
            top: cardAt.y + 34,
          }}
        >
          <PinCard
            property={selected.property}
            onClose={() => {
              choose(null)
              draw()
            }}
          />
        </div>
      )}
    </div>
  )
}
