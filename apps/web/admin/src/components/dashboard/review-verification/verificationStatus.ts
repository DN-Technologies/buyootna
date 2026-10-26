export type VerificationStatus = 'قيد الانتظار' | 'موثق' | 'مرفوض' | 'غير موثق'

export interface VerificationStatusStyle {
  label: VerificationStatus
  textColor: string
  dotColor: string
}

const STYLES: Record<VerificationStatus, VerificationStatusStyle> = {
  موثق: { label: 'موثق', textColor: 'text-[#1791E7]', dotColor: 'bg-[#1791E7]' },
  مرفوض: { label: 'مرفوض', textColor: 'text-[#9C1E28]', dotColor: 'bg-[#9C1E28]' },
  'غير موثق': {
    label: 'غير موثق',
    textColor: 'text-[#6B6A6A]',
    dotColor: 'bg-[#6B6A6A]',
  },
  'قيد الانتظار': {
    label: 'قيد الانتظار',
    textColor: 'text-[#B97500]',
    dotColor: 'bg-[#B97500]',
  },
}

/** The request's status (pending when the row has none) and its colours. */
export function verificationStatusStyle(
  status: string | null | undefined,
): VerificationStatusStyle {
  return STYLES[status as VerificationStatus] ?? STYLES['قيد الانتظار']
}
