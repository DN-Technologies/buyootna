import { UserRow } from '../UserTable'

export interface ChangePlanDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess?: (userId: string, planName: string) => void
  user?: UserRow | null
  userId?: string
  userName?: string
  userEmail?: string
  accountType?: string
  currentPlanLabel?: string
}

export type PlanTiming = 'immediate' | 'after_expiry'
