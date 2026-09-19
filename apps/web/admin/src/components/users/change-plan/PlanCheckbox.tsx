'use client'

import React from 'react'

interface PlanCheckboxProps {
  checked: boolean
  className?: string
}

export default function PlanCheckbox({ checked, className = '' }: PlanCheckboxProps) {
  if (checked) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="16" height="16" rx="4" fill="#15304D" />
        <path
          d="M4.5 8L7 10.5L11.5 5.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="3.5"
        stroke="#D7D7D7"
        fill="white"
      />
    </svg>
  )
}
