'use client'

import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export default function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#E2E8F0] rounded-md ${className}`}
      {...props}
    />
  )
}
