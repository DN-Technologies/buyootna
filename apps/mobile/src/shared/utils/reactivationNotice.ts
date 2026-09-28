import { showAlert } from '@/shared/utils/alert';

/**
 * Signing in to an account the user had suspended reactivates it (the API
 * flags the login response with `reactivated`); let them know.
 */
export function notifyIfReactivated(loginResponse: { reactivated?: boolean }) {
  if (loginResponse?.reactivated) {
    showAlert(
      'مرحباً بعودتك',
      'تم إعادة تفعيل حسابك، وعادت إعلاناتك وخدماتك للظهور.',
    );
  }
}
