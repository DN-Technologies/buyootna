import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  // Where "عرض الكل" leads; omitted when there is no full list
  allHref?: string
}

/** A section's heading with its optional "عرض الكل" link. */
export default function SectionHeader({ title, allHref }: SectionHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between">
      <h2 className="text-[22px] font-bold tracking-[-0.52px] text-ink md:text-[26px]">
        {title}
      </h2>
      {allHref && (
        <Link
          href={allHref}
          className="flex h-10 items-center rounded-full px-4.5 text-sm font-bold text-brand-dark transition hover:bg-tag"
        >
          عرض الكل
        </Link>
      )}
    </div>
  )
}
