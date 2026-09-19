'use client'

import React from 'react'

interface PlanRadioProps {
  checked: boolean
  className?: string
}

export default function PlanRadio({ checked, className = '' }: PlanRadioProps) {
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
        <circle
          cx="8"
          cy="8"
          r="7.25"
          stroke="#15304D"
          strokeWidth="1.5"
        />
        <circle cx="8" cy="8" r="4" fill="#15304D" />
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
      <circle cx="8" cy="8" r="7.5" stroke="#D7D7D7" />
    </svg>
  )
}
