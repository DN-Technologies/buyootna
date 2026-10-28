import { router } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import { resetToIdentityHome } from './getIdentityHomeRoute';

/**
 * Opens `route` as the account's persona `identityId` (e.g. a request sent to
 * the company, tapped while using the owner's individual profile): switches
 * to it first, as the profile switcher does, then opens the screen. Without
 * an id, or already on it, just opens it.
 */
export async function openAsPersona(
  route: string,
  identityId?: string | null,
) {
  const { activeIdentity, identities, switchIdentity } =
    useAuthStore.getState();
  const target = identityId
    ? identities.find((i) => i.id === identityId)
    : undefined;
  if (!target || target.id === activeIdentity?.id) {
    router.push(route as never);
    return;
  }

  const previousType = activeIdentity?.type;
  const switching = switchIdentity(target.id);
  resetToIdentityHome(target.type);
  try {
    await switching;
  } catch (error) {
    console.error('Failed to switch identity:', error);
    // The previous profile is back: so is its home
    resetToIdentityHome(previousType);
    showAlert('تعذر تبديل الهوية', 'تحقق من الاتصال وحاول مرة أخرى');
    return;
  }
  router.push(route as never);
}
