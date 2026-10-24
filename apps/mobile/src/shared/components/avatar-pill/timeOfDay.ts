// With nothing new, the gap shows the time of day: the sun until 17:00, the
// sunset until 20:00 (around Maghrib in Kuwait), then the moon until 05:00
export function timeOfDayGlyph(hour: number) {
  if (hour >= 5 && hour < 17) return { icon: 'sun', label: 'صباح الخير' } as const;
  if (hour >= 17 && hour < 20) {
    return { icon: 'sunset', label: 'مساء الخير' } as const;
  }
  return { icon: 'moon', label: 'مساء الخير' } as const;
}
