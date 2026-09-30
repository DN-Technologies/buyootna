import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  settingsService,
  UserSettingsResponse,
} from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

export const SETTINGS_QUERY_KEY = ['userSettings'];

export type SettingsPatch = Partial<Omit<UserSettingsResponse, 'id' | 'userId'>>;

/**
 * The user's privacy toggles. Changes show immediately and are saved in the
 * background; if saving fails they're put back and the user is told.
 */
export function useUserSettings() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => settingsService.getSettings(),
    enabled: !!token,
  });

  const updateSettings = async (patch: SettingsPatch) => {
    const previous =
      queryClient.getQueryData<UserSettingsResponse>(SETTINGS_QUERY_KEY);
    queryClient.setQueryData<UserSettingsResponse>(
      SETTINGS_QUERY_KEY,
      (prev) => (prev ? { ...prev, ...patch } : prev),
    );
    try {
      await settingsService.updateSettings(patch);
    } catch (e) {
      console.error('Failed to update settings:', e);
      queryClient.setQueryData(SETTINGS_QUERY_KEY, previous);
      showAlert('خطأ', 'تعذر حفظ الإعداد، حاول مرة أخرى');
    }
  };

  return {
    isLoading,
    showPhone: settings?.showPhone ?? true,
    showWhatsapp: settings?.showWhatsapp ?? true,
    hideActivity: settings?.hideActivity ?? false,
    hideOfficeAds: settings?.hideOfficeAds ?? false,
    updateSettings,
  };
}
