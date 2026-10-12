import type { LegalBlock } from '@/lib/legal/types'

/**
 * A policy page's text. What comes before the first heading is the
 * introduction, set darker than the sections that follow.
 */
export default function LegalDocument({ blocks }: { blocks: LegalBlock[] }) {
  const firstHeading = blocks.findIndex((block) => block.kind === 'heading')
  const introEnd = firstHeading === -1 ? blocks.length : firstHeading

  return (
    <article className="mx-auto w-full max-w-7xl px-5 pt-2 pb-24 text-[15px] leading-normal tracking-[-0.408px] text-muted">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h2
              key={index}
              className="mt-8 mb-3 text-lg leading-[1.3] font-medium tracking-normal text-ink"
            >
              {block.text}
            </h2>
          )
        }
        if (block.kind === 'subheading') {
          return (
            <h3
              key={index}
              className="mt-4 font-medium text-[#363636] first:mt-0"
            >
              {block.text}
            </h3>
          )
        }
        if (block.kind === 'bullet') {
          return (
            <p key={index} className="flex gap-2.5 pr-1.5">
              <span
                aria-hidden
                className="mt-2.25 h-1 w-1 shrink-0 rounded-full bg-muted"
              />
              <span>{block.text}</span>
            </p>
          )
        }
        return (
          <p key={index} className={index < introEnd ? 'text-ink' : undefined}>
            {block.text}
          </p>
        )
      })}
    </article>
  )
}
