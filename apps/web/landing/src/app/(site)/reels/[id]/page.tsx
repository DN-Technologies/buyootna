import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/layout/PageHeader'
import { CATEGORY_LABELS } from '@/lib/categories'
import { getReel } from '@/lib/data'
import { formatNumber, timeAgo } from '@/lib/format'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const reel = await getReel((await params).id)
  if (!reel) return { title: 'الفيديو غير موجود — بيوتنا' }
  const title = `فيديو من ${reel.author.name} — بيوتنا`
  const description =
    reel.caption?.slice(0, 160) ??
    `شاهد هذا الفيديو من ${reel.author.name} على بيوتنا`
  return {
    title,
    description,
    // What a shared link shows in WhatsApp and other apps
    openGraph: {
      title,
      description,
      type: 'video.other',
      images: [reel.posterUrl],
      videos: [{ url: reel.mediaUrl, type: 'video/mp4' }],
    },
  }
}

/**
 * A shared reel for someone who may not have the app: the video, who posted
 * it, its listing, and a way into the app. Web plays don't count as views,
 * because a guest can't be told apart.
 */
export default async function ReelPage({ params }: PageProps) {
  const reel = await getReel((await params).id)
  if (!reel) notFound()

  const listing = reel.property

  return (
    <>
      <PageHeader title="ريلز" crumb="فيديو" />
      <main className="mx-auto flex w-full max-w-250 flex-col items-center gap-8 px-4 py-8 md:flex-row md:items-start md:justify-center">
        <video
          data-testid="reel-video"
          src={reel.mediaUrl}
          poster={reel.posterUrl}
          controls
          playsInline
          loop
          preload="metadata"
          className="aspect-[9/16] w-full max-w-[360px] rounded-2xl bg-black object-contain"
        />

        <div className="flex w-full max-w-[420px] flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
              {reel.author.logoUrl ? (
                // A logo from anywhere the company uploaded it to
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reel.author.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-brand">
                  {reel.author.name.trim().charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-ink">
                {reel.author.name}
              </h1>
              <p className="text-sm text-muted">
                {timeAgo(reel.publishedAt)} · {formatNumber(reel.viewCount)}{' '}
                مشاهدة
              </p>
            </div>
          </div>

          {reel.caption && (
            <p className="text-base leading-normal font-medium whitespace-pre-wrap text-ink">
              {reel.caption}
            </p>
          )}

          {listing && (
            <Link
              href={`/properties/${listing.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line p-3"
            >
              {listing.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.coverUrl}
                  alt=""
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {[CATEGORY_LABELS[listing.category], listing.location]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              <span className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
                عرض الإعلان
              </span>
            </Link>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              data-testid="reel-open-app"
              href={`buyootnamobile://reels?startId=${reel.id}`}
              className="flex-1 rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white"
            >
              فتح في التطبيق
            </a>
            <Link
              href="/"
              className="flex-1 rounded-full border border-brand px-6 py-3 text-center text-sm font-semibold text-brand"
            >
              تعرّف على بيوتنا
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
