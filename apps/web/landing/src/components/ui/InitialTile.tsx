// Stand-in for a missing logo: the name's first letter on a coloured tile
const COLORS = [
  '#065F46',
  '#15304D',
  '#7C2D12',
  '#3730A3',
  '#831843',
  '#0F766E',
]

export default function InitialTile({
  name,
  size,
  className = '',
}: {
  name: string
  size: number
  className?: string
}) {
  const letter = name.trim().charAt(0) || 'ب'
  const color = COLORS[(name.codePointAt(0) ?? 0) % COLORS.length]
  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size / 2,
      }}
    >
      {letter}
    </div>
  )
}
