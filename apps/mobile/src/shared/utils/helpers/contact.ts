// How people reach an advertiser from an ad

type HostRole = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE' | string | undefined | null;

/** Companies and offices have no WhatsApp: phone or in-app chat only. */
export function hostHasWhatsapp(role: HostRole): boolean {
  return role !== 'COMPANY' && role !== 'OFFICE';
}

/**
 * The number to call/WhatsApp for an ad: the ad's own number, else the
 * advertiser persona's contact number. Never a made-up fallback.
 */
export function adContactPhone(property?: {
  phoneNumber?: string | null;
  phone?: string | null;
  host?: { phone?: string | null } | null;
} | null): string | null {
  return (
    property?.phoneNumber || property?.phone || property?.host?.phone || null
  );
}
