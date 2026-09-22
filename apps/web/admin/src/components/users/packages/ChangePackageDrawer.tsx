'use client'

import React from 'react'
import ChangePlanDrawer from '../ChangePlanDrawer'

export interface ChangePackageDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  userName?: string
  userEmail?: string
  accountType?: string
  currentPlanLabel?: string
}

export default function ChangePackageDrawer({
  open,
  onClose,
  onSuccess,
  userId,
  userName,
  userEmail,
  accountType,
  currentPlanLabel,
}: ChangePackageDrawerProps) {
  return (
    <ChangePlanDrawer
      open={open}
      onClose={onClose}
      onSuccess={() => onSuccess()}
      userId={userId}
      userName={userName}
      userEmail={userEmail}
      accountType={accountType}
      currentPlanLabel={currentPlanLabel}
    />
  )
}
