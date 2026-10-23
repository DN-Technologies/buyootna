import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyCompanyProjects } from '@/features/company/hooks/useMyCompanyProjects';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import UndoToast from '@/shared/components/ui/UndoToast';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';
import {
  PORTFOLIO_SORT_OPTIONS,
  type PortfolioSort,
  visibleProjects,
} from './portfolio.utils';
import PortfolioEmptyState from './PortfolioEmptyState';
import PortfolioOptionsMenu from './PortfolioOptionsMenu';
import PortfolioProjectCard from './PortfolioProjectCard';
import { usePortfolioActions } from './usePortfolioActions';
import { usePortfolioToast, visibilityToastMessage } from './usePortfolioToast';

const failed = (title: string) => (error: unknown) =>
  showAlert(title, getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'), [
    { text: 'حسناً' },
  ]);

/**
 * More › معرض الأعمال (Figma 4410:169500): the company's projects with
 * search and sort, ⋮ to hide or delete them all, «تعديل» on each, and
 * «اضافة مشروع».
 */
export default function PortfolioScreen() {
  const router = useRouter();
  const { projects, isLoading, refetch } = useMyCompanyProjects();
  const { setAllHidden, deleteAll } = usePortfolioActions();
  const { toast, show: showToast, clear: clearToast } = usePortfolioToast();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PortfolioSort>('ALL');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const hideAllRef = useRef<BottomSheetModal>(null);
  const deleteAllRef = useRef<BottomSheetModal>(null);

  const shown = useMemo(
    () => visibleProjects(projects, search, sort),
    [projects, search, sort],
  );
  const isSearching = search.trim().length > 0;
  const allHidden = projects.length > 0 && projects.every((p) => p.isHidden);

  const addProject = () => router.push('/add-project');
  const editProject = (id: string) => router.push(`/edit-project/${id}` as never);

  const toggleAllHidden = async () => {
    const hide = !allHidden;
    try {
      await setAllHidden(hide);
      showToast(visibilityToastMessage(hide, true), () => setAllHidden(!hide));
    } catch (error) {
      failed('تعذر تحديث المشاريع')(error);
    }
  };

  const confirmDeleteAll = () => {
    deleteAll().catch(failed('فشل حذف المشاريع'));
  };

  const undoToast = () => {
    const undo = toast?.undo;
    clearToast();
    undo?.().catch(failed('تعذر التراجع'));
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <CompanyFormHeader
        title="معرض الأعمال"
        onBack={() => router.back()}
        trailing={
          <TouchableOpacity
            testID="portfolio-options"
            accessibilityLabel="خيارات"
            activeOpacity={0.7}
            onPress={() => setMenuOpen(true)}
            disabled={projects.length === 0}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Image
              source={require('@/assets/icons/portfolio/more-dots.svg')}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
          </TouchableOpacity>
        }
      />

      {/* Search on the right, sort on the left (RTL) */}
      <View className="h-[42px] flex-row items-center gap-2 px-4">
        <View className="h-[42px] flex-1 flex-row items-center gap-[6px] rounded-full border border-[#ECECEC] bg-[#F9FAFE] px-3">
          <Image
            source={require('@/assets/icons/portfolio/search.svg')}
            style={{ width: 24, height: 24 }}
            contentFit="contain"
          />
          <TextInput
            testID="portfolio-search"
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن مشروع..."
            placeholderTextColor="#989898"
            returnKeyType="search"
            className="h-full flex-1 text-right font-cairo text-[13px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          />
        </View>
        <TouchableOpacity
          testID="portfolio-sort"
          accessibilityLabel="الترتيب حسب"
          activeOpacity={0.7}
          onPress={() => sortSheetRef.current?.present()}
          className="h-[42px] w-[42px] items-center justify-center rounded-full border border-[#ECECEC] bg-[#F9FAFE]"
        >
          <Image
            source={require('@/assets/icons/portfolio/sort.svg')}
            style={{ width: 22, height: 22 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="px-4 pt-4">
          {[1, 2, 3].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : shown.length === 0 ? (
        <PortfolioEmptyState
          noMatches={projects.length > 0}
          onAdd={addProject}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
        >
          {isSearching ? (
            <View className="h-[34px] justify-center">
              <Text
                testID="portfolio-results-count"
                className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                {shown.length} نتائج بحث
              </Text>
            </View>
          ) : (
            <View className="h-3" />
          )}
          {shown.map((project, i) => (
            <View key={project.id}>
              {i > 0 && <View className="my-5 h-px bg-[#ECECEC]" />}
              <PortfolioProjectCard
                project={project}
                onEdit={(p) => editProject(p.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {/* Fixed «اضافة مشروع», except on the empty states (they have their own) */}
      {!isLoading && shown.length > 0 && (
        <View
          className="bg-white px-3 pb-8 pt-4"
          style={{
            shadowColor: '#9D9D9D',
            shadowOpacity: 0.25,
            shadowRadius: 2.45,
            shadowOffset: { width: -2, height: 0 },
            elevation: 4,
          }}
        >
          <CompanySubmitButton
            label="اضافة مشروع"
            disabled={false}
            onPress={addProject}
          />
        </View>
      )}

      <UndoToast
        visible={!!toast}
        message={toast?.message ?? ''}
        onUndo={undoToast}
        onDismiss={clearToast}
        testID="portfolio-toast"
      />

      <PortfolioOptionsMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        allHidden={allHidden}
        onToggleAllHidden={() =>
          allHidden ? void toggleAllHidden() : hideAllRef.current?.present()
        }
        onDeleteAll={() => deleteAllRef.current?.present()}
      />

      <RadioSelectionSheet
        ref={sortSheetRef}
        title="الترتيب حسب"
        options={PORTFOLIO_SORT_OPTIONS}
        selectedValue={sort}
        onSelect={(value) => setSort(value as PortfolioSort)}
      />

      <ConfirmActionSheet
        ref={hideAllRef}
        title="اخفاء جميع المشاريع مؤقتا؟"
        description="سيتم إخفاء جميع الأعمال من صفحتك ولن يتمكن العملاء من رؤيتها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة."
        confirmLabel="اخفاء المشاريع"
        icon={
          <Image
            source={require('@/assets/icons/portfolio/hide-eye.svg')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        }
        onConfirm={() => void toggleAllHidden()}
      />

      <ConfirmActionSheet
        ref={deleteAllRef}
        variant="danger"
        title="هل ترغب في حذف جميع المشاريع نهائيا؟"
        description="هل أنت متأكد من رغبتك في حذف جميع مشاريعك ؟ سيتم إزالتهم تماماً من ملفك ولن يتمكن العملاء من رؤيتها مجدداً."
        confirmLabel="حذف المشاريع"
        iconBackground="#FFEBEB"
        icon={
          <Image
            source={require('@/assets/icons/portfolio/delete-trash.svg')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        }
        onConfirm={confirmDeleteAll}
      />
    </SafeAreaView>
  );
}
