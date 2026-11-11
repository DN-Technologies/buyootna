import { TERMS_OF_USE } from './terms'
import type { LegalBlock } from './types'

const REFUND_HEADING = 'الاسترجاع والاسترداد المالي:'

/**
 * «سياسة الاسترجاع والاسترداد» on its own page (/refund-policy), as payment
 * providers ask (Tap Payments). Taken from the terms' own section, so the two
 * never differ: everything after its heading, up to the next one.
 */
function refundSection(blocks: LegalBlock[]): LegalBlock[] {
  const start = blocks.findIndex(
    (b) => b.kind === 'heading' && b.text === REFUND_HEADING,
  )
  if (start === -1) throw new Error('The terms have no refund section')
  const end = blocks.findIndex(
    (b, i) => i > start && b.kind === 'heading',
  )
  return blocks.slice(start + 1, end === -1 ? undefined : end)
}

export const REFUND_POLICY: LegalBlock[] = refundSection(TERMS_OF_USE)
