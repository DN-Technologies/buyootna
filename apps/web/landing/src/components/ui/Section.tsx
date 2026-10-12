import type { ReactNode } from 'react'

/** The site's content column: 1240px wide, with side padding on small screens. */
export default function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-5 ${className}`}>
      {children}
    </section>
  )
}
