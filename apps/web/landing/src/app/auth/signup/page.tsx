import type { Metadata } from 'next'

import BusinessSignup from '@/components/auth/BusinessSignup'
import IndividualSignup from '@/components/auth/IndividualSignup'
import { isAccountType } from '@/lib/accountTypes'
import { param, type RawSearchParams } from '@/lib/searchParams'

export const metadata: Metadata = {
  title: 'تسجيل جديد — بيوتنا',
}

/** `?type=` picks the form: an individual's, or a company's / office's. */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const requested = param(await searchParams, 'type')
  const type = isAccountType(requested) ? requested : 'individual'

  return type === 'individual' ? (
    <IndividualSignup />
  ) : (
    // Remounts on a switch so each kind starts from a clean form
    <BusinessSignup key={type} kind={type} />
  )
}
