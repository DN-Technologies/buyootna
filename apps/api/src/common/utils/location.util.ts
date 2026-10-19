// A place saved as a raw map pin ("29.37643,47.98654"): company sign-up used
// to store the coordinates in hqLocation instead of the address name
const COORDINATES = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/;

/** A location fit to show people: the text, or null for bare coordinates. */
export function readableLocation(text?: string | null): string | null {
  if (!text || COORDINATES.test(text)) return null;
  return text.trim() || null;
}

// نبذة عن الشركة / المكتب: the longest accepted (the app enforces it too)
export const ABOUT_MAX_LENGTH = 300;
