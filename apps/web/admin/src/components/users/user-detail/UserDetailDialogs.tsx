'use client'

import ChangePackageDrawer from '@/components/users/packages/ChangePackageDrawer'
import AddExceptionalFeatureDrawer from '@/components/users/packages/AddExceptionalFeatureDrawer'
import AddCouponModal from '@/components/users/AddCouponModal'
import SuccessToast from '@/components/users/SuccessToast'
import type { AdminUserDetail } from '@/lib/admin-users'
import type { useUserDetailDialogs } from './useUserDetailDialogs'
import type { UserDetailView } from './user-detail.utils'

interface UserDetailDialogsProps {
  user: AdminUserDetail
  identityId: string | undefined
  view: UserDetailView
  dialogs: ReturnType<typeof useUserDetailDialogs>
}

/** The header's drawers and modal (for the selected persona) and the toast. */
export default function UserDetailDialogs({
  user,
  identityId,
  view,
  dialogs,
}: UserDetailDialogsProps) {
  const { openDialog, closeDialog, showToast } = dialogs
  const name = view.displayName

  return (
    <>
      {/* Floating Success Toast (Figma Node 5634:72196) */}
      <SuccessToast
        message={dialogs.toastMessage || ''}
        isOpen={!!dialogs.toastMessage}
        onClose={dialogs.dismissToast}
      />

      <ChangePackageDrawer
        open={openDialog === 'change_package'}
        onClose={closeDialog}
        onSuccess={() => showToast('تم تغيير الباقة بنجاح.')}
        userId={user.id}
        identityId={identityId}
        userName={name}
        userEmail={user.email || '—'}
        accountType={view.accountType}
        currentPlanLabel={user.activePlan?.name || 'العادية'}
      />

      <AddExceptionalFeatureDrawer
        userId={user.id}
        identityId={identityId}
        open={openDialog === 'add_exceptional_feature'}
        onClose={closeDialog}
        onSuccess={() =>
          showToast(`تم منح مميزات استثنائية للمستخدم “${name}” بنجاح.`)
        }
      />

      {/* Add Discount Coupon Modal (Figma Nodes 5634:71560, 5634:71598, 5634:71780) */}
      <AddCouponModal
        user={{ id: user.id, name, email: user.email }}
        isOpen={openDialog === 'add_coupon'}
        onClose={closeDialog}
        onSuccess={() =>
          showToast(`تم اضافة كوبون خصم للمستخدم “${name}” بنجاح.`)
        }
      />
    </>
  )
}
