import BugView from '@/components/bugs/BugView'

export default async function BugPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BugView id={id} />
}
