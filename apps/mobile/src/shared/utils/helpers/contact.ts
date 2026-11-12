// How people reach an advertiser from an ad

type HostRole = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE' | string | undefined | null;

/** Companies and offices have no WhatsApp: phone or in-app chat only. */
export function hostHasWhatsapp(role: HostRole): boolean {
  return role !== 'COMPANY' && role !== 'OFFICE';
}

/**
 * WhatsApp is only between individuals: a company or office is never
 * reached by it, and doesn't use it either (no WhatsApp button anywhere in
 * their app). `viewer` is the active profile's type; signed out counts as
 * an individual.
 */
export function canUseWhatsapp(viewer: HostRole, target: HostRole): boolean {
  return hostHasWhatsapp(viewer) && hostHasWhatsapp(target);
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

/**
 * The ad's own «طرق التواصل»: «اتصال» / «واتساب» switched off when it was
 * published are not shown (QA: both showed, calling the account's number).
 * Older ads, without the flags, show both as before.
 */
export function adShowsCall(property?: { showPhone?: boolean | null } | null) {
  return property?.showPhone !== false;
}

export function adShowsWhatsapp(
  property?: { showWhatsapp?: boolean | null } | null,
) {
  return property?.showWhatsapp !== false;
}
