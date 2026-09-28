export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Hides the last 4 digits; falls back to a placeholder when unknown
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '•••• 965 4821+';
  const clean = phone.trim();
  if (clean.length < 6) return '•••• 965 4821+';
  const visible = clean.slice(0, clean.length - 4);
  return `${visible} ••••`;
}
