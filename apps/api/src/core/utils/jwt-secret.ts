/**
 * The secret that signs logins, password-reset tokens, account-reactivation
 * tickets and chat connections.
 *
 * Each server sets its own `JWT_SECRET` in `apps/api/.env`; development and
 * production never share one, so a token from one is refused by the other.
 * In production a missing or short secret stops the API at startup. It used
 * to fall back to a fixed string from this repo, and production ran on it:
 * anyone who knew the string could sign in as any user (found 2026-11-04).
 * Locally (not production) a development-only value keeps `start:dev` and
 * the tests working without one.
 */
const MIN_PRODUCTION_LENGTH = 32;
const LOCAL_DEVELOPMENT_SECRET = 'local-development-only-jwt-secret';

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() ?? '';
  if (process.env.NODE_ENV !== 'production') {
    return secret || LOCAL_DEVELOPMENT_SECRET;
  }
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Add a long random value to apps/api/.env on this server ' +
        '(e.g. openssl rand -hex 48) and restart the API.',
    );
  }
  if (secret.length < MIN_PRODUCTION_LENGTH) {
    throw new Error(
      `JWT_SECRET is too short (${secret.length} characters; at least ${MIN_PRODUCTION_LENGTH}). ` +
        'Use a long random value (e.g. openssl rand -hex 48) and restart the API.',
    );
  }
  return secret;
}
