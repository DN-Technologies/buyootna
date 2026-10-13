import { useRouter } from 'expo-router';

import { settingsService } from '@/shared/api/settings.service';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { Identity, useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

/** "ملف الشركة «البنيان»" for the profile being removed. */
export function profileLabel(identity: Identity): string {
  if (identity.type === 'COMPANY') {
    const name = identity.companyData?.name?.trim();
    return name ? `ملف الشركة «${name}»` : 'ملف الشركة';
  }
  if (identity.type === 'OFFICE') {
    const name = identity.officeData?.name?.trim();
    return name ? `ملف المكتب «${name}»` : 'ملف المكتب';
  }
  return 'الملف الشخصي';
}

/**
 * Asks for confirmation, then deletes the account and signs out. With more
 * than one profile on the account it first asks which: the profile in use
 * only (the others stay, under the same login) or the whole account.
 */
export function useDeleteAccount() {
  const router = useRouter();

  const confirmWholeAccount = () => {
    showAlert(
      'حذف الحساب نهائياً',
      'هل أنت متأكد من رغبتك في حذف الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح جميع بياناتك.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.deleteAccount();
              await useAuthStore.getState().logout();
              router.replace('/(auth)/individual-auth');
            } catch (error) {
              console.error(error);
              showAlert('خطأ', 'حدث خطأ أثناء حذف الحساب');
            }
          },
        },
      ],
    );
  };

  // The session belongs to the profile in use, so it moves to another
  // profile first; if the removal is refused it moves back.
  const deleteProfile = async (profile: Identity, next: Identity) => {
    const { switchIdentity, removeIdentity } = useAuthStore.getState();
    try {
      await switchIdentity(next.id);
    } catch (error) {
      console.error(error);
      showAlert('خطأ', 'حدث خطأ أثناء حذف الملف، حاول مرة أخرى');
      return;
    }
    try {
      await settingsService.deleteIdentity(profile.id);
    } catch (error) {
      console.error(error);
      await switchIdentity(profile.id).catch(() => undefined);
      showAlert(
        'تعذر حذف الملف',
        getApiErrorMessage(error, 'حدث خطأ أثناء حذف الملف، حاول مرة أخرى'),
      );
      return;
    }
    removeIdentity(profile.id);
    resetToIdentityHome(next.type);
  };

  const confirmProfile = (profile: Identity, next: Identity) => {
    showAlert(
      `حذف ${profileLabel(profile)}`,
      'سيُحذف هذا الملف وبياناته نهائياً، وتبقى ملفاتك الأخرى على الحساب نفسه. هذا الإجراء لا يمكن التراجع عنه.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => void deleteProfile(profile, next),
        },
      ],
    );
  };

  return () => {
    const { activeIdentity, identities } = useAuthStore.getState();
    const others = (identities ?? []).filter((i) => i.id !== activeIdentity?.id);
    if (!activeIdentity || others.length === 0) {
      confirmWholeAccount();
      return;
    }
    // Back to the personal profile when there is one
    const next = others.find((i) => i.type === 'INDIVIDUAL') ?? others[0];
    showAlert(
      'حذف الحساب',
      `لديك أكثر من ملف على هذا الحساب. يمكنك حذف ${profileLabel(activeIdentity)} فقط والإبقاء على ملفاتك الأخرى، أو حذف الحساب بالكامل بكل ملفاته.`,
      [
        {
          text: 'حذف هذا الملف فقط',
          style: 'destructive',
          onPress: () => confirmProfile(activeIdentity, next),
        },
        {
          text: 'حذف الحساب بالكامل',
          style: 'destructive',
          onPress: confirmWholeAccount,
        },
        { text: 'إلغاء', style: 'cancel' },
      ],
    );
  };
}
