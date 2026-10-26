import AccountView from '@/components/tools/AccountView'

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AccountView id={id} />
}
