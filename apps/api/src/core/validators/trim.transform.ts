// Whitespace-only input (e.g. "   ") passes @IsNotEmpty as-is -- trim
// before validation so it's rejected as empty instead of stored verbatim.
export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
