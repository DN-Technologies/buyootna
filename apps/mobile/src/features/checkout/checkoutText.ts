import type {
  CheckoutPurpose,
  PaymentMethod,
  PaymentStatusResponse,
} from '@/shared/api/payments.service';

/** «5 د.ك», «3.75 د.ك», «-2 د.ك»: KWD keeps up to 3 decimals (fils). */
export function formatKwd(amount: number, negative = false): string {
  const value = Number(amount.toFixed(3)).toString();
  return `${negative && amount > 0 ? '-' : ''}${value} د.ك`;
}

/** The first «ملخص الدفع» line, by what is bought. */
export function priceLabel(purpose: CheckoutPurpose): string {
  if (purpose === 'subscription') return 'ثمن الاشتراك';
  if (purpose === 'feature') return 'ثمن التمييز';
  return 'ثمن الباقة';
}

/**
 * The methods to offer: what the server offers, in the design's order,
 * with Apple Pay only on iOS and Google Pay only on Android.
 */
export function methodsForPlatform(
  offered: PaymentMethod[],
  os: string,
): PaymentMethod[] {
  const order: PaymentMethod[] = ['apple_pay', 'google_pay', 'card', 'knet'];
  return order.filter((method) => {
    if (!offered.includes(method)) return false;
    if (method === 'apple_pay') return os === 'ios';
    if (method === 'google_pay') return os === 'android';
    return true;
  });
}

const dayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-KW-u-nu-latn', {
    day: 'numeric',
    month: 'long',
  });

/** «تم الدفع بنجاح»'s text (Figma 5576:144886), from what was bought. */
export function successMessage(
  purpose: CheckoutPurpose,
  status: Partial<PaymentStatusResponse>,
): string {
  const done = 'تمت عملية الدفع بنجاح';
  if (purpose === 'subscription') {
    const plan = status.planDetails || 'الاشتراك';
    return status.endsAt
      ? `${done}، وتم تفعيل ${plan} على حسابك لتنتهي يوم ${dayMonth(status.endsAt)}.`
      : `${done}، وتم تفعيل ${plan} على حسابك.`;
  }
  if (purpose === 'feature') {
    return status.endsAt
      ? `${done}، وتم تمييز إعلانك حتى ${dayMonth(status.endsAt)}.`
      : `${done}، وتم تمييز إعلانك.`;
  }
  const plan = status.planName ? `الباقة ${status.planName}` : 'الباقة';
  return `${done}، وتم تفعيل ${plan} على حسابك.`;
}
