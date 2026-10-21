import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import { companyService } from '@/shared/api/company.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import CompanyManageList from './CompanyManageList';

// More › الخدمات: the company's services, with delete and إضافة خدمة
export default function MyServicesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const { services, specialty, isLoading, refetch } = useMyCompanyServices();

  const remove = async (id: string) => {
    try {
      await companyService.deleteService(id);
      await queryClient.invalidateQueries({ queryKey: ['companyServices'] });
      // The profile carries the services' names too
      refreshProfile();
    } catch (error) {
      showAlert(
        'فشل حذف الخدمة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  return (
    <CompanyManageList
      title="الخدمات"
      intro={specialty ? `التخصص: ${specialty}` : null}
      items={services.map((service) => ({
        id: service.id,
        // "اخرى" services carry their own title
        title: service.title || service.type,
        subtitle: service.description,
      }))}
      isLoading={isLoading}
      onRefresh={refetch}
      emptyTitle="لا توجد خدمات بعد"
      emptyDescription="أضف خدماتك ليتمكن العملاء من العثور عليك وطلب عروض الأسعار."
      addLabel="إضافة خدمة"
      onAdd={() => router.push('/add-service')}
      onBack={() => router.back()}
      deleteTitle="حذف هذه الخدمة؟"
      deleteDescription="لن تظهر الخدمة في ملف شركتك بعد الآن."
      onDelete={remove}
    />
  );
}
