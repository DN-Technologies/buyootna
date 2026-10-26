'use client'

import React from 'react'
import ChangePlanDrawer from '../ChangePlanDrawer'

export interface ChangePackageDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  identityId?: string
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
  identityId,
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
      identityId={identityId}
      userName={userName}
      userEmail={userEmail}
      accountType={accountType}
      currentPlanLabel={currentPlanLabel}
    />
  )
}
