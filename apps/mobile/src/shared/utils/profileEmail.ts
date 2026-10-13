/**
 * What Edit Profile sends as `email`:
 * - the address when the field has one,
 * - null to remove the address on file when the field was cleared (the API
 *   allows it only for an account that signs in by phone),
 * - nothing when there was none to begin with.
 * An empty string is never sent: the API reads it as "not sent", which is
 * why a cleared address used to come back (QA).
 */
export function emailForSave(
  fieldValue: string | null | undefined,
  onFile: string | null | undefined,
): string | null | undefined {
  const email = (fieldValue ?? '').trim();
  if (email) return email;
  return onFile?.trim() ? null : undefined;
}
