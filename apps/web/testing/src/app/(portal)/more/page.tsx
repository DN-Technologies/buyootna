import MoreView from '@/components/MoreView'
import { requireSession } from '@/lib/session'

export default async function MorePage() {
  const tester = await requireSession()
  return <MoreView name={tester.name} />
}
