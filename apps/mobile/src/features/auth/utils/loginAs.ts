import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import type { AuthState, IdentityType } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { notifyIfReactivated } from '@/shared/utils/reactivationNotice';
import {
  isReactivationDeclined,
  withReactivationPrompt,
} from '@/shared/utils/scheduledDeactivation';

export const IDENTITY_TYPE_LABELS: Record<IdentityType, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب',
};

interface Credentials {
  identifier: string;
  password: string;
}

/**
 * Signs in to the persona picked on the login screen (فرد / مكتب / شركة)
 * and opens its home. The server picks that persona of the account, so an
 * office login lands on the office dashboard without passing through the
 * individual one. If the account has no persona of that type, offers the
 * ones it has. Errors are shown here; resolves once the attempt is over.
 */
export async function loginAs(
  credentials: Credentials,
  identityType: IdentityType,
  setAuth: AuthState['setAuth'],
): Promise<void> {
  try {
    const response = await withReactivationPrompt(
      apiClient.post('/auth/login', { ...credentials, identityType }),
    );
    const { user, activeIdentity, identities, access_token, sessionId } =
      response.data;

    await setAuth(user, activeIdentity, identities, access_token, sessionId);
    notifyIfReactivated(response.data);

    // The token's persona, as the server opened it
    resetToIdentityHome(activeIdentity?.type);
  } catch (error: any) {
    // "No" to reactivating early: stay on the login screen, no error
    if (isReactivationDeclined(error)) return;

    const data = error?.response?.data;
    if (data?.code === 'IDENTITY_TYPE_NOT_FOUND') {
      const available: IdentityType[] = (data.availableTypes ?? []).filter(
        (type: IdentityType) => type in IDENTITY_TYPE_LABELS,
      );
      showAlert('لا يوجد هذا الحساب', data.message, [
        ...available.map((type) => ({
          text: `الدخول كـ${IDENTITY_TYPE_LABELS[type]}`,
          onPress: () => {
            void loginAs(credentials, type, setAuth);
          },
        })),
        { text: 'إلغاء', style: 'cancel' as const },
      ]);
      return;
    }

    showAlert(
      'فشل تسجيل الدخول',
      getApiErrorMessage(error, 'حدث خطأ في الاتصال'),
    );
  }
}

/**
 * Signs in to a profile just created, staying on the screen: sign-up shows
 * its success sheet first, and «العودة الى الرئيسية» then opens the home.
 * The sign-up's verify call makes the account but no session, so a new
 * company landed on the guest home (QA). Resolves the profile signed in to,
 * or null if it couldn't (the user can still log in by hand).
 */
export async function signInAfterSignup(
  credentials: Credentials,
  identityType: IdentityType,
  setAuth: AuthState['setAuth'],
): Promise<IdentityType | null> {
  try {
    const { data } = await apiClient.post('/auth/login', {
      ...credentials,
      identityType,
    });
    await setAuth(
      data.user,
      data.activeIdentity,
      data.identities,
      data.access_token,
      data.sessionId,
    );
    return data.activeIdentity?.type ?? identityType;
  } catch {
    return null;
  }
}
