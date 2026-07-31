type ClearFn = () => void;

const clearFns = new Set<ClearFn>();

/**
 * Lets per-identity-type feature stores (e.g. features/individual's
 * favorites store) hook into auth-driven resets without useAuthStore
 * having to import type-scoped feature code directly.
 */
export function registerIdentityScopedStore(clear: ClearFn) {
  clearFns.add(clear);
}

export function clearIdentityScopedStores() {
  clearFns.forEach((clear) => clear());
}
