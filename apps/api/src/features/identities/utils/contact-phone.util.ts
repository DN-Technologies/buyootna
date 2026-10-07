import { IdentityType } from '@prisma/client';

export interface ContactIdentityLike {
  type: IdentityType | string;
  useAccountPhone?: boolean | null;
  contactPhone?: string | null;
  individualData?: { whatsapp?: string | null; [key: string]: unknown } | null;
}

export interface ContactUserLike {
  phone?: string | null;
  whatsapp?: string | null;
}

/**
 * The number people call to reach this persona: the account's phone, or the
 * persona's own SMS-verified number when it opted out of sharing it.
 */
export function contactPhoneOf(
  identity: ContactIdentityLike,
  user?: ContactUserLike | null,
): string | null {
  if (identity.useAccountPhone === false) return identity.contactPhone ?? null;
  return user?.phone ?? null;
}

/**
 * WhatsApp for this persona. Companies and offices have none: they're reached
 * by phone or in-app chat only.
 */
export function contactWhatsappOf(
  identity: ContactIdentityLike,
  user?: ContactUserLike | null,
): string | null {
  if (identity.type === 'COMPANY' || identity.type === 'OFFICE') return null;
  return (
    identity.individualData?.whatsapp ||
    user?.whatsapp ||
    contactPhoneOf(identity, user)
  );
}

// The fields contactPhoneOf/contactWhatsappOf need, for Prisma selects
export const CONTACT_IDENTITY_SELECT = {
  type: true,
  useAccountPhone: true,
  contactPhone: true,
} as const;
