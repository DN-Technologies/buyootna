import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { tabsFor } from '@/components/users/UserDetailTabs'
import { setActiveAccountType } from '@/lib/active-account-type'
import type { AdminUserDetail } from '@/lib/admin-users'
import { DEFAULT_TAB, SLUG_TO_TAB, TAB_SLUGS, UserRole } from './constants'
import { selectIdentity } from './user-detail.utils'

/**
 * The page's place in the URL: the selected identity (`?identity=`) and the
 * tab (`?tab=`), with the handlers that change them. Also points the side
 * nav at the shown identity's type while the page is open.
 */
export function useUserDetailNavigation(user: AdminUserDetail | null) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const identity = user
    ? selectIdentity(user.identities ?? [], searchParams.get('identity'))
    : undefined
  const role = (identity?.type || user?.role || 'INDIVIDUAL') as UserRole

  const slug = searchParams.get('tab')
  const requestedTab = (slug && SLUG_TO_TAB[slug]) || DEFAULT_TAB
  // A tab the selected persona doesn't have (المعرض on an individual) opens the overview
  const activeTab = tabsFor(role).includes(requestedTab)
    ? requestedTab
    : DEFAULT_TAB

  const replaceParams = (update: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    update(params)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const changeTab = (tab: string) =>
    replaceParams((params) => params.set('tab', TAB_SLUGS[tab] || 'overview'))

  const changeIdentity = (identityId: string) => {
    const next = user?.identities.find((i) => i.id === identityId)
    if (!next) return
    replaceParams((params) => {
      params.set('identity', identityId)
      if (!tabsFor(next.type).includes(activeTab)) params.delete('tab')
    })
  }

  // The side nav highlights the shown identity's type, until the page closes
  useEffect(() => {
    if (!identity) return
    setActiveAccountType(
      identity.type.toLowerCase() as 'individual' | 'company' | 'office',
    )
  }, [identity])
  useEffect(() => () => setActiveAccountType(null), [])

  return { identity, role, activeTab, changeTab, changeIdentity }
}
