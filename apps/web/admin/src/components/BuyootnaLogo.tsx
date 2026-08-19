import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  fill?: string
}

/**
 * Full Buyootna Horizontal Logo
 */
export function BuyootnaFullLogo({
  className = 'w-48 h-auto object-contain',
  width = 192,
  height = 48,
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Buyootna Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

/**
 * Compact Buyootna Icon
 */
export function BuyootnaIconMark({
  className = 'w-11 h-11 object-contain',
  width = 44,
  height = 44,
}: LogoProps) {
  return (
    <Image
      src="/logo-icon.png"
      alt="Buyootna Icon"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
