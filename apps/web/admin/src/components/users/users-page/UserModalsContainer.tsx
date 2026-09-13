import React from 'react'
import { UserRow } from '@/components/users/UserTable'
import AddUserDrawer from '@/components/users/AddUserDrawer'
import ChangePlanDrawer from '@/components/users/ChangePlanDrawer'
import SendNotificationModal from '@/components/users/SendNotificationModal'
import AddCouponModal from '@/components/users/AddCouponModal'
import SuspendUserModal from '@/components/users/SuspendUserModal'
import ReactivateUserModal from '@/components/users/ReactivateUserModal'
import BlockUserModal from '@/components/users/BlockUserModal'
import ResetPasswordModal from '@/components/users/ResetPasswordModal'
import SuccessToast from '@/components/users/SuccessToast'

export interface UserModalsState {
  addDialogOpen: boolean
  planModalUser: UserRow | null
  notificationModalUser: UserRow | null
  couponModalUser: UserRow | null
  couponModalUsers?: UserRow[] | null
  suspendModalUser: UserRow | null
  reactivateModalUser: UserRow | null
  blockModalUser: UserRow | null
  resetPasswordModalUser: UserRow | null
  toastMessage: string | null
}

export interface UserModalsHandlers {
  setAddDialogOpen: (open: boolean) => void
  setPlanModalUser: (user: UserRow | null) => void
  setNotificationModalUser: (user: UserRow | null) => void
  setCouponModalUser: (user: UserRow | null) => void
  setCouponModalUsers?: (users: UserRow[] | null) => void
  setSuspendModalUser: (user: UserRow | null) => void
  setReactivateModalUser: (user: UserRow | null) => void
  setBlockModalUser: (user: UserRow | null) => void
  setResetPasswordModalUser: (user: UserRow | null) => void
  setToastMessage: (msg: string | null) => void
  onAddUserSuccess: () => void
  onPlanSuccess: (userId: string, planName: string) => void
  onNotificationSuccess: (userId: string, title: string) => void
  onCouponSuccess: (targetIds: string[]) => void
  onResetPasswordSuccess: () => void
  onSuspendConfirm: (
    user: UserRow,
    durationDays?: number,
    reason?: string,
  ) => Promise<void>
  onReactivateConfirm: (
    user: UserRow,
    sendNotification: boolean,
  ) => Promise<void>
  onBlockConfirm: (
    user: UserRow,
    reason?: string,
    sendEmail?: boolean,
    preventNewAccount?: boolean,
  ) => Promise<void>
}

interface UserModalsContainerProps {
  state: UserModalsState
  handlers: UserModalsHandlers
}

export const UserModalsContainer: React.FC<UserModalsContainerProps> = ({
  state,
  handlers,
}) => {
  const isCouponOpen =
    !!state.couponModalUser ||
    !!(state.couponModalUsers && state.couponModalUsers.length > 0)

  return (
    <>
      <SuccessToast
        isOpen={!!state.toastMessage}
        message={state.toastMessage || undefined}
        onClose={() => handlers.setToastMessage(null)}
      />

      <AddUserDrawer
        open={state.addDialogOpen}
        onClose={() => handlers.setAddDialogOpen(false)}
        onSuccess={handlers.onAddUserSuccess}
      />

      <ChangePlanDrawer
        user={state.planModalUser}
        open={!!state.planModalUser}
        onClose={() => handlers.setPlanModalUser(null)}
        onSuccess={handlers.onPlanSuccess}
      />

      <SendNotificationModal
        user={state.notificationModalUser}
        isOpen={!!state.notificationModalUser}
        onClose={() => handlers.setNotificationModalUser(null)}
        onSuccess={handlers.onNotificationSuccess}
      />

      <AddCouponModal
        user={state.couponModalUser}
        users={state.couponModalUsers}
        isOpen={isCouponOpen}
        onClose={() => {
          handlers.setCouponModalUser(null)
          handlers.setCouponModalUsers?.(null)
        }}
        onSuccess={handlers.onCouponSuccess}
      />

      <SuspendUserModal
        user={state.suspendModalUser}
        isOpen={!!state.suspendModalUser}
        onClose={() => handlers.setSuspendModalUser(null)}
        onConfirm={handlers.onSuspendConfirm}
      />

      <ReactivateUserModal
        user={state.reactivateModalUser}
        isOpen={!!state.reactivateModalUser}
        onClose={() => handlers.setReactivateModalUser(null)}
        onConfirm={handlers.onReactivateConfirm}
      />

      <BlockUserModal
        user={state.blockModalUser}
        isOpen={!!state.blockModalUser}
        onClose={() => handlers.setBlockModalUser(null)}
        onConfirm={handlers.onBlockConfirm}
      />

      <ResetPasswordModal
        user={state.resetPasswordModalUser}
        isOpen={!!state.resetPasswordModalUser}
        onClose={() => handlers.setResetPasswordModalUser(null)}
        onSuccess={handlers.onResetPasswordSuccess}
      />
    </>
  )
}

export default UserModalsContainer
