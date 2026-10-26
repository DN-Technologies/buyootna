import { useState } from 'react'

export type UserDetailDialog = 'change_package' | 'add_exceptional_feature' | 'add_coupon'

const DIALOGS: UserDetailDialog[] = [
  'change_package',
  'add_exceptional_feature',
  'add_coupon',
]

/** The header's إجراءات that open a drawer or modal, and the success toast. */
export function useUserDetailDialogs() {
  const [openDialog, setOpenDialog] = useState<UserDetailDialog | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleHeaderAction = (action: string) => {
    if ((DIALOGS as string[]).includes(action)) {
      setOpenDialog(action as UserDetailDialog)
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 4000)
  }

  return {
    openDialog,
    closeDialog: () => setOpenDialog(null),
    handleHeaderAction,
    toastMessage,
    showToast,
    dismissToast: () => setToastMessage(null),
  }
}
