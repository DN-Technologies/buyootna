import TabBar from '@/components/TabBar'
import { requireSession } from '@/lib/session'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession()
  return (
    <>
      <main className="pb-tabbar mx-auto w-full max-w-xl px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        {children}
      </main>
      <TabBar />
    </>
  )
}
