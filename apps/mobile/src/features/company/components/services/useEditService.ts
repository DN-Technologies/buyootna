import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { DESCRIPTION_MAX_LENGTH } from '@/features/company/components/add-service/useAddService';
import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import type { MyCompanyService, ServicesUpdate } from '@/shared/api/company.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { useServicesActions } from './useServicesActions';
import { serviceVisibilityMessage, useServicesToast } from './useServicesToast';

/**
 * تعديل الخدمة (Figma 4410:170024): the whole service's switch, each
 * sub-service's switch, and the description, saved together with «حفظ
 * التغييرات». Deleting a sub-service (after its confirmation) is
 * immediate.
 */
export function useEditService() {
  const router = useRouter();
  const data = useMyCompanyServices();
  const { updateServices, deleteService } = useServicesActions();
  const showToast = useServicesToast((s) => s.show);

  const [isVisible, setIsVisible] = useState(true);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toDelete, setToDelete] = useState<MyCompanyService | null>(null);
  const deleteSheetRef = useRef<BottomSheetModal>(null);

  // The form starts from the server's state once it is known
  useEffect(() => {
    if (!data.isLoading && !loaded) {
      setIsVisible(!data.servicesHidden);
      setHidden(
        Object.fromEntries(data.services.map((s) => [s.id, !!s.isHidden])),
      );
      setDescription(data.description ?? '');
      setLoaded(true);
    }
  }, [data, loaded]);

  // A sub-service added or deleted meanwhile joins (or leaves) the form
  useEffect(() => {
    if (!loaded) return;
    setHidden((current) =>
      Object.fromEntries(
        data.services.map((s) => [s.id, current[s.id] ?? !!s.isHidden]),
      ),
    );
  }, [data.services, loaded]);

  const patch = useMemo((): ServicesUpdate => {
    const changes: ServicesUpdate = {};
    if (isVisible === data.servicesHidden) changes.servicesHidden = !isVisible;
    if (description.trim() !== (data.description ?? '')) {
      changes.description = description.trim();
    }
    const rows = data.services
      .filter((s) => s.id in hidden && hidden[s.id] !== !!s.isHidden)
      .map((s) => ({ id: s.id, isHidden: hidden[s.id] }));
    if (rows.length) changes.rows = rows;
    return changes;
  }, [isVisible, description, hidden, data]);

  const isDirty = Object.keys(patch).length > 0;
  const isValid = description.length <= DESCRIPTION_MAX_LENGTH;

  const toggleRow = (id: string) =>
    setHidden((current) => ({ ...current, [id]: !current[id] }));

  const save = async () => {
    if (!isDirty || !isValid || isSaving) return;
    setIsSaving(true);
    try {
      await updateServices(patch);
      if (patch.servicesHidden !== undefined) {
        const hide = patch.servicesHidden;
        showToast(serviceVisibilityMessage(hide), () =>
          updateServices({ servicesHidden: !hide }),
        );
      }
      router.back();
    } catch (error) {
      showAlert(
        'فشل حفظ التغييرات',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    } finally {
      setIsSaving(false);
    }
  };

  const askToDelete = (service: MyCompanyService) => {
    setToDelete(service);
    deleteSheetRef.current?.present();
  };

  const confirmDelete = async () => {
    const service = toDelete;
    setToDelete(null);
    if (!service) return;
    try {
      await deleteService(service.id);
    } catch (error) {
      showAlert(
        'فشل حذف الخدمة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  return {
    isLoading: data.isLoading,
    specialty: data.specialty,
    createdAt: data.createdAt,
    services: data.services,
    goBack: () => router.back(),
    isVisible,
    setIsVisible,
    hidden,
    toggleRow,
    description,
    setDescription,
    isExpanded,
    toggleExpanded: () => setIsExpanded((v) => !v),
    canSave: isDirty && isValid && !isSaving,
    save,
    toDelete,
    deleteSheetRef,
    askToDelete,
    confirmDelete,
  };
}
