import { useRouter } from 'expo-router';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

/** Asks for confirmation, then deletes the account and signs out. */
export function useDeleteAccount() {
  const router = useRouter();

  return () => {
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
}
