import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ContentContainer from '@/shared/components/ContentContainer';
import OfficeAboutTab from '@/shared/components/office/OfficeAboutTab';
import OfficeBottomBar from '@/shared/components/office/OfficeBottomBar';
import OfficeHeaderCard from '@/shared/components/office/OfficeHeaderCard';
import OfficeListingsTab from '@/shared/components/office/OfficeListingsTab';
import OfficeModals from '@/shared/components/office/OfficeModals';
import OfficeNavBar from '@/shared/components/office/OfficeNavBar';
import OfficeServicesTab from '@/shared/components/office/OfficeServicesTab';
import OfficeTabsSwitcher, {
  OfficeTab,
} from '@/shared/components/office/OfficeTabsSwitcher';
import CompanyDetailSkeleton from '@/shared/components/skeletons/CompanyDetailSkeleton';
import { useOfficeDetails } from '@/shared/hooks/useOfficeDetails';
import { useOfficeReport } from '@/shared/hooks/useOfficeReport';
import { useOfficeReviews } from '@/shared/hooks/useOfficeReviews';

export default function OfficeProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const officeId =
    typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const [activeTab, setActiveTab] = useState<OfficeTab>('about');
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Modal references
  const addReviewSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const quoteModalRef = useRef<BottomSheetModal>(null);

  // Data & Business Logic Hooks (Separation of Concerns)
  const {
    office,
    isLoading,
    isError,
    services,
    properties,
    workingHours,
    targetUserId,
  } = useOfficeDetails(officeId);

  const {
    reviewSummary,
    reviews,
    displayedReviews,
    visibleReviewsCount,
    reviewSort,
    setReviewSort,
    handleShowMoreReviews,
    handleAddReview,
    handleToggleLike,
    handleToggleDislike,
  } = useOfficeReviews(targetUserId, Boolean(office));

  const { reportSheetRef, handleOpenReport, handleSubmitReport } =
    useOfficeReport(targetUserId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* Navigation Bar */}
        <OfficeNavBar
          onBack={() => router.back()}
          onOpenReport={handleOpenReport}
        />

        {isLoading ? (
          <CompanyDetailSkeleton />
        ) : isError || !office ? (
          <View className="flex-1 items-center justify-center p-5">
            <Text className="font-cairo-bold text-base text-[#111111]">
              {isError ? 'تعذر تحميل بيانات المكتب' : 'لم يتم العثور على المكتب'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
          >
            <View className="px-5 pt-4">
              {/* Header Info Card */}
              <OfficeHeaderCard office={office} />

              {/* Tab Navigation Switcher */}
              <OfficeTabsSwitcher
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Tab Contents */}
              {activeTab === 'about' && (
                <OfficeAboutTab
                  licenseNumber={office.licenseNumber}
                  workingHours={workingHours}
                  reviewSummary={reviewSummary}
                  reviews={reviews}
                  displayedReviews={displayedReviews}
                  visibleReviewsCount={visibleReviewsCount}
                  onOpenSort={() => sortSheetRef.current?.present()}
                  onOpenAddReview={() => addReviewSheetRef.current?.present()}
                  onToggleLike={handleToggleLike}
                  onToggleDislike={handleToggleDislike}
                  onShowMoreReviews={handleShowMoreReviews}
                />
              )}

              {activeTab === 'services' && (
                <OfficeServicesTab services={services} />
              )}

              {activeTab === 'listings' && (
                <OfficeListingsTab
                  properties={properties}
                  onFilterPress={() => filterSheetRef.current?.present()}
                />
              )}
            </View>
          </ScrollView>
        )}

        {/* Fixed Bottom Quote Request Action Bar */}
        <OfficeBottomBar
          onRequestQuote={() => quoteModalRef.current?.present()}
        />

        {/* Coordinated Modals & Bottom Sheets */}
        <OfficeModals
          addReviewSheetRef={addReviewSheetRef}
          sortSheetRef={sortSheetRef}
          filterSheetRef={filterSheetRef}
          quoteModalRef={quoteModalRef}
          reportSheetRef={reportSheetRef}
          companyName={office?.name || 'المكتب'}
          companySubtitle={office?.bio}
          companyLogoUrl={office?.logoUrl}
          services={services.length ? services : undefined}
          targetIdentityId={office?.id}
          reviewSort={reviewSort}
          propertyFilter={propertyFilter}
          onSelectSort={setReviewSort}
          onSelectPropertyFilter={setPropertyFilter}
          onAddReview={handleAddReview}
          onSubmitReport={handleSubmitReport}
        />
      </ContentContainer>
    </SafeAreaView>
  );
}
