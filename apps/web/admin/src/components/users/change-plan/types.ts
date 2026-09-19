import { UserRow } from '../UserTable'

export interface ChangePlanDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess?: (userId: string, planName: string) => void
  user?: UserRow | null
  userName?: string
  userEmail?: string
  accountType?: string
  currentPlanLabel?: string
}

export interface SubTier {
  id: string
  name: string
  price: string
}

export interface PlanDefinition {
  id: 'basic' | 'gold'
  name: string
  subTiers: SubTier[]
}

export type PlanTiming = 'immediate' | 'after_expiry'
