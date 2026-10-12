/* eslint-disable @next/next/no-img-element -- listing photos are uploaded by
   advertisers to storage hosts the image optimizer isn't configured for */
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PropertyGalleryProps {
  images: string[]
  alt: string
  isFeatured: boolean
  // "منذ ساعتين"
  published: string
  views: number
}

/**
 * The ad's photos: a large one with the featured tag and the age and view
 * count over it, and the rest as thumbnails that swap into it. An ad
 * without photos gets the brand panel instead.
 */
export default function PropertyGallery({
  images,
  alt,
  isFeatured,
  published,
  views,
}: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0)
  const hasPhotos = images.length > 0

  return (
    <div className="flex flex-col gap-5">
      <div className="relative aspect-820/443 w-full overflow-hidden rounded-lg bg-tag">
        {hasPhotos ? (
          <img
            src={images[current]}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <Image
              src="/landing/auth-bg.jpg"
              alt=""
              fill
              sizes="820px"
              className="object-cover"
            />
            <Image
              src="/landing/auth-logo.png"
              alt="Buyootna"
              width={268}
              height={181}
              className="absolute top-1/2 left-1/2 w-1/3 -translate-x-1/2 -translate-y-1/2"
            />
          </>
        )}
        {isFeatured && (
          <span className="absolute top-6 right-6 flex h-5.25 items-center rounded-tl-[10px] rounded-tr-lg rounded-bl-[10px] bg-linear-to-l from-[#FF8D28] to-[#FACC15] px-2.5 text-base leading-none tracking-[-0.408px] text-ink">
            مميز
          </span>
        )}
        <span className="absolute right-6 bottom-6 flex items-center gap-1 rounded-[10px] bg-white/80 px-1.5 py-1 text-xs leading-[1.2] font-semibold text-ink">
          {published}
          <span>-</span>
          <span className="flex items-center gap-0.5">
            {views}
            <Image
              src="/landing/detail-eye.svg"
              alt="مشاهدة"
              width={16}
              height={16}
            />
          </span>
        </span>
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-5 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              aria-label={`الصورة ${index + 1}`}
              aria-current={index === current}
              onClick={() => setCurrent(index)}
              className={`relative aspect-190/163 w-[calc(25%-15px)] min-w-28 shrink-0 overflow-hidden rounded-lg bg-tag ${
                index === current ? 'ring-2 ring-brand ring-offset-2' : ''
              }`}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
