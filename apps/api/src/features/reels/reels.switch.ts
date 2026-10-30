/**
 * The hidden switch: REELS_ENABLED=true opens reels to everyone; otherwise
 * only the accounts in REELS_TESTER_USER_IDS (comma-separated) get in. Read
 * on every request, from the server's apps/api/.env, so changing it needs an
 * API restart but no app update.
 */
export function reelsEnabledFor(
  userId: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.REELS_ENABLED === 'true') return true;
  if (!userId) return false;
  return (env.REELS_TESTER_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .includes(userId);
}
