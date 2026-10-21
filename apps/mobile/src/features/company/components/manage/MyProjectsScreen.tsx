import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useMyCompanyProjects } from '@/features/company/hooks/useMyCompanyProjects';
import { companyService } from '@/shared/api/company.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import CompanyManageList from './CompanyManageList';

// More › معرض الأعمال: the company's projects, with delete and اضافة مشروع
export default function MyProjectsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const { projects, isLoading, refetch } = useMyCompanyProjects();

  const remove = async (id: string) => {
    try {
      await companyService.deleteProject(id);
      await queryClient.invalidateQueries({ queryKey: ['companyProjects'] });
      refreshProfile();
    } catch (error) {
      showAlert(
        'فشل حذف المشروع',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  return (
    <CompanyManageList
      title="معرض الأعمال"
      items={projects.map((project) => ({
        id: project.id,
        title: project.title,
        subtitle: project.description,
        imageUrl: project.images[0] ?? null,
      }))}
      isLoading={isLoading}
      onRefresh={refetch}
      emptyTitle="لا توجد مشاريع بعد"
      emptyDescription="أضف صور أعمالك السابقة ليتعرف العملاء على جودة عملك."
      addLabel="إضافة مشروع"
      onAdd={() => router.push('/add-project')}
      onBack={() => router.back()}
      deleteTitle="حذف هذا المشروع؟"
      deleteDescription="لن يظهر المشروع وصوره في معرض أعمالك بعد الآن."
      onDelete={remove}
    />
  );
}
