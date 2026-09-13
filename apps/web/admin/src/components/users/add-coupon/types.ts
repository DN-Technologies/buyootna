import { UserRow } from '../UserTable'
import { AvailableCoupon } from '@/lib/admin-users'

export type CouponModalTargetUser =
  | UserRow
  | {
      id: string
      name?: string | null
      email?: string | null
      accountType?: string
      role?: string
    }

export interface AddCouponModalProps {
  user?: CouponModalTargetUser | null
  users?: CouponModalTargetUser[] | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (targetIds: string[], code: string, name: string) => void
}

export type { AvailableCoupon }
