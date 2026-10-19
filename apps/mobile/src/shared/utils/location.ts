// A place saved as a raw map pin ("29.37643,47.98654"): company sign-up used
// to store the coordinates instead of the address name
const COORDINATES = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/;

export const isCoordinates = (text?: string | null): boolean =>
  !!text && COORDINATES.test(text);

/** A location fit to show people: the text, or '' for bare coordinates. */
export const readableLocation = (text?: string | null): string =>
  text && !isCoordinates(text) ? text.trim() : '';

// نبذة عن الشركة / المكتب: the longest the app and the API accept
export const ABOUT_MAX_LENGTH = 300;
