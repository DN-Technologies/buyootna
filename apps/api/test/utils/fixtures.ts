/** A valid Kuwait mobile number per isPhone()'s regex — [569]\d{7} — unique enough per test run. */
export function randomKuwaitPhone(): string {
  const sevenDigits = Math.floor(1000000 + Math.random() * 9000000);
  return `5${sevenDigits}`;
}

export function randomEmail(): string {
  return `test-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`;
}

export const TEST_PASSWORD = 'Password123!';
