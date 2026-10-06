// Prices and counts must always render Western digits (1,234) regardless
// of the device locale — an Arabic system language must not switch the
// numerals to ١٬٢٣٤ (QA: numeral style is a design requirement, not a
// locale preference). Always format numbers through this helper; never
// call toLocaleString() bare.
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
