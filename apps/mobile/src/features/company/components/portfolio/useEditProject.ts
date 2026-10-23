import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DESCRIPTION_MAX_LENGTH,
  MAX_IMAGES,
} from '@/features/company/components/add-project/useAddProject';
import { useMyCompanyProjects } from '@/features/company/hooks/useMyCompanyProjects';
import type { ProjectUpdate } from '@/shared/api/company.service';
import { propertiesService } from '@/shared/api/properties.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { usePortfolioActions } from './usePortfolioActions';
import { usePortfolioToast, visibilityToastMessage } from './usePortfolioToast';

// A photo already on the server, as opposed to one just picked
const isUploaded = (uri: string) => /^https?:\/\//.test(uri);

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * تعديل المشروع (Figma 8464:26503): the project's fields, edited locally
 * and saved together. «حفظ التغييرات» is enabled once something changed.
 * A change of حالة ظهور المشروع is announced on the list with «تراجع».
 */
export function useEditProject(projectId: string) {
  const router = useRouter();
  const { projects, isLoading } = useMyCompanyProjects();
  const project = projects.find((p) => p.id === projectId) ?? null;
  const { updateProject, deleteProject } = usePortfolioActions();
  const showToast = usePortfolioToast((s) => s.show);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const deleteSheetRef = useRef<BottomSheetModal>(null);

  // The form starts from the project once it is known
  useEffect(() => {
    if (project && loadedId !== project.id) {
      setTitle(project.title);
      setDescription(project.description);
      setImages(project.images);
      setIsVisible(!project.isHidden);
      setLoadedId(project.id);
    }
  }, [project, loadedId]);

  const patch = useMemo((): ProjectUpdate => {
    if (!project) return {};
    const changes: ProjectUpdate = {};
    if (title.trim() !== project.title) changes.title = title.trim();
    if (description.trim() !== project.description) {
      changes.description = description.trim();
    }
    if (!sameList(images, project.images)) changes.images = images;
    if (isVisible === project.isHidden) changes.isHidden = !isVisible;
    return changes;
  }, [project, title, description, images, isVisible]);

  const isDirty = Object.keys(patch).length > 0;
  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    description.length <= DESCRIPTION_MAX_LENGTH &&
    images.length > 0;

  const pick = async (limit: number): Promise<string[]> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!', [
        { text: 'حسناً' },
      ]);
      return [];
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: limit > 1,
      quality: 0.8,
      selectionLimit: limit,
    });
    return result.canceled ? [] : result.assets.map((a) => a.uri);
  };

  /** «اضافة صورة»: up to MAX_IMAGES in all. */
  const addImages = async () => {
    const picked = await pick(MAX_IMAGES - images.length);
    if (picked.length) {
      setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    }
  };

  /** The pen on a photo: another one in its place. */
  const replaceImage = async (index: number) => {
    const [picked] = await pick(1);
    if (picked) {
      setImages((prev) => prev.map((uri, i) => (i === index ? picked : uri)));
    }
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    if (!project || !isDirty || !isValid || isSaving) return;
    setIsSaving(true);
    try {
      const body = { ...patch };
      if (body.images) {
        // New photos go up first, then the list keeps its order
        const local = body.images.filter((uri) => !isUploaded(uri));
        const urls = local.length
          ? await propertiesService.uploadImages(local)
          : [];
        let next = 0;
        body.images = body.images.map((uri) =>
          isUploaded(uri) ? uri : urls[next++],
        );
      }
      await updateProject(project.id, body);
      if (body.isHidden !== undefined) {
        const hidden = body.isHidden;
        showToast(visibilityToastMessage(hidden), () =>
          updateProject(project.id, { isHidden: !hidden }),
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

  const confirmDelete = async () => {
    if (!project) return;
    try {
      await deleteProject(project.id);
      router.back();
    } catch (error) {
      showAlert(
        'فشل حذف المشروع',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  return {
    project,
    isLoading,
    goBack: () => router.back(),
    title,
    setTitle,
    description,
    setDescription,
    images,
    addImages,
    replaceImage,
    removeImage,
    isVisible,
    setIsVisible,
    canSave: isDirty && isValid && !isSaving,
    isSaving,
    save,
    deleteSheetRef,
    askToDelete: () => deleteSheetRef.current?.present(),
    confirmDelete,
  };
}
