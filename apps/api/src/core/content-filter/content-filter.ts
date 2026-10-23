import { BadRequestException } from '@nestjs/common';

import { BANNED_WORDS } from './banned-words';

/**
 * Objectionable-content filter (App Store Guideline 1.2): public content
 * (listings, reviews, story captions, requests, profiles) with a banned word
 * is refused; chat text has the word masked instead.
 */

// Arabic prefixes a banned word may carry: و، ف، ب، ل، يا، ال and their mixes
const ARABIC_PREFIXES = [
  'وال',
  'فال',
  'بال',
  'لل',
  'ال',
  'يا',
  'و',
  'ف',
  'ب',
  'ل',
];

const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  $: 's',
};

// A word as typed: letters, digits and the leetspeak symbols
const WORD = /[\p{L}\p{M}\p{N}@$]+/gu;

/** One word, compared the way the list is: spelling variants folded. */
export function normalizeWord(word: string): string {
  return (
    word
      .toLowerCase()
      // Diacritics, the superscript alef and tatweel
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/[0134@$]/g, (c) => LEET[c] ?? c)
      // "fuuuck", "كسسس": repeated letters count once
      .replace(/(.)\1+/gu, '$1')
  );
}

const EXACT = new Set<string>();
const PREFIXES: string[] = [];
for (const entry of BANNED_WORDS) {
  if (entry.endsWith('*')) PREFIXES.push(normalizeWord(entry.slice(0, -1)));
  else EXACT.add(normalizeWord(entry));
}

function matches(normalized: string): boolean {
  return (
    EXACT.has(normalized) || PREFIXES.some((p) => normalized.startsWith(p))
  );
}

/** Whether one typed word is banned, with or without an Arabic prefix. */
function isBannedWord(word: string): boolean {
  const normalized = normalizeWord(word);
  if (matches(normalized)) return true;
  return ARABIC_PREFIXES.some(
    (p) =>
      normalized.length > p.length + 1 &&
      normalized.startsWith(p) &&
      matches(normalized.slice(p.length)),
  );
}

/** The banned words in a text, as typed (empty when it is clean). */
export function findBanned(text: string | null | undefined): string[] {
  if (!text) return [];
  return (text.match(WORD) ?? []).filter(isBannedWord);
}

/** The text with each banned word replaced by ***. */
export function maskBanned(text: string): string {
  return text.replace(WORD, (word) => (isBannedWord(word) ? '***' : word));
}

/** The answer when public content contains a banned word. */
export function objectionableContentError(): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: 'المحتوى يحتوي على كلمات غير لائقة، يرجى تعديله',
    code: 'OBJECTIONABLE_CONTENT',
  });
}

/** Refuses the save when any of these texts contains a banned word. */
export function assertCleanContent(
  ...texts: (string | null | undefined)[]
): void {
  if (texts.some((t) => findBanned(t).length > 0)) {
    throw objectionableContentError();
  }
}
