/** What a charge pays for, when it isn't a plan (carried through Tap's redirect). */
export type PaymentPurpose = 'feature';

export interface TapPhonePayload {
  country_code: string;
  number: string;
}

export interface TapChargeResponse {
  id?: string;
  status?: string;
  transaction?: {
    url?: string;
  };
  errors?: Array<{
    description?: string;
  }>;
  reference?: {
    transaction?: string;
    order?: string;
  };
}

/** What POST /payments/charge and /payments/feature-charge return. */
export interface ChargeResult {
  checkoutUrl: string | null | undefined;
  invoiceId: string;
  status: 'PAID' | 'PENDING';
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function newInvoiceNo() {
  return `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
}

/** Invoices are due 7 days after they're issued. */
export function invoiceDueDate() {
  return new Date(Date.now() + 7 * DAY_MS);
}
