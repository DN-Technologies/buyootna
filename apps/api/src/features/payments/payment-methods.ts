import { BadRequestException } from '@nestjs/common';

/**
 * «طريقة الدفع» on the payment screen and the Tap source each one opens:
 * Tap's hosted page, already on that method. The client sends a method
 * name, never a source id of its own.
 */
export const PAYMENT_METHOD_SOURCES = {
  apple_pay: 'src_apple_pay',
  google_pay: 'src_google_pay',
  card: 'src_card',
  knet: 'src_kw.knet',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD_SOURCES;

export const ALL_PAYMENT_METHODS = Object.keys(
  PAYMENT_METHOD_SOURCES,
) as PaymentMethod[];

const isPaymentMethod = (value: string): value is PaymentMethod =>
  value in PAYMENT_METHOD_SOURCES;

/**
 * The methods this server offers: TAP_SOURCES (method names, comma
 * separated) lists those enabled on the Tap account; unset offers them all.
 */
export function enabledPaymentMethods(
  env: string | undefined = process.env.TAP_SOURCES,
): PaymentMethod[] {
  if (!env?.trim()) return ALL_PAYMENT_METHODS;
  return env
    .split(',')
    .map((m) => m.trim().toLowerCase())
    .filter(isPaymentMethod);
}

// What older app builds may still send as sourceId
const LEGACY_SOURCES = new Set<string>([
  'src_all',
  ...Object.values(PAYMENT_METHOD_SOURCES),
]);

/**
 * The Tap source for a charge: the chosen method's (refused when it isn't
 * offered), else an older client's known sourceId, else all methods.
 */
export function tapSourceFor(
  method?: string | null,
  legacySourceId?: string | null,
  enabled: PaymentMethod[] = enabledPaymentMethods(),
): string {
  if (method) {
    const name = method.trim().toLowerCase();
    if (!isPaymentMethod(name) || !enabled.includes(name)) {
      throw new BadRequestException('طريقة الدفع غير متاحة');
    }
    return PAYMENT_METHOD_SOURCES[name];
  }
  if (legacySourceId && LEGACY_SOURCES.has(legacySourceId)) {
    return legacySourceId;
  }
  return 'src_all';
}
