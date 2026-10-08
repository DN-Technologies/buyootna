import { TextStyle } from 'react-native';

/**
 * Arabic text that must start from the right edge of its box even when it
 * begins with a number or Latin letters ("600 د.ك", "Ebrahim"). Without an
 * explicit direction such lines hugged the left edge (QA, ad picker).
 */
export const RTL_TEXT: TextStyle = { writingDirection: 'rtl', textAlign: 'auto' };
