import { useSyncExternalStore } from 'react'

export type AccountType = 'individual' | 'company' | 'office'

/**
 * The account type a page is about when its URL doesn't say (`?type=`): the
 * user page sets the selected identity's, so the side nav highlights
 * الأفراد / الشركات / المكاتب العقارية as the switcher changes.
 */
let current: AccountType | null = null
const listeners = new Set<() => void>()

export function setActiveAccountType(type: AccountType | null) {
  if (type === current) return
  current = type
  listeners.forEach((listener) => listener())
}

export function useActiveAccountType(): AccountType | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
    () => null,
  )
}
