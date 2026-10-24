export const GOLD = '#C5A36D';

// The icons' row: chat 34 + 8 + divider + 8 + bell 34
export const ACTIONS_WIDTH = 84.5;
// Closed, the icons' slot keeps Figma's 96pt pill: 4 + 42 + 8 + 10 + 8 + 20 + 4
export const CLOSED_SLOT = 10;
// With something going on, the closed slot widens to hold the notch
export const PULSE_SLOT = 54;
// Where the slot starts, from the ‹ side: 4 + the chevron's 20 + 8
export const SLOT_OFFSET = 32;
// Open: 4 + 42 + 8 + the icons + 8 + 20 + 4, and the 0.5pt border each side
export const AVATAR_PILL_OPEN_WIDTH = 86 + ACTIONS_WIDTH + 1;
// Two taps on the photo this close together switch profile (as Facebook)
export const DOUBLE_TAP_MS = 280;
// While something is unread, the closed ‹ nudges sideways every few seconds,
// as if it wanted to open
export const NUDGE_PX = 3;
export const NUDGE_STEP_MS = 70;
export const NUDGE_PAUSE_MS = 2600;
