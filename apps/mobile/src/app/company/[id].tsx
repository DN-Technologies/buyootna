import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileHighlights from '@/features/stories/components/ProfileHighlights';
import { useProviderStoryRing } from '@/features/stories/hooks/useProviderStoryRing';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import CompanyAboutTab from '@/shared/components/company/CompanyAboutTab';
import CompanyBottomBar from '@/shared/components/company/CompanyBottomBar';
import CompanyGalleryTab from '@/shared/components/company/CompanyGalleryTab';
import CompanyHeaderCard from '@/shared/components/company/CompanyHeaderCard';
import CompanyModals from '@/shared/components/company/CompanyModals';
import CompanyNavBar from '@/shared/components/company/CompanyNavBar';
import CompanyServicesTab from '@/shared/components/company/CompanyServicesTab';
import CompanyTabsSwitcher, {
  CompanyTab,
} from '@/shared/components/company/CompanyTabsSwitcher';
import CompanyDetailSkeleton from '@/shared/components/skeletons/CompanyDetailSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useAuthGuard } from '@/shared/hooks/auth/useAuthGuard';
import { useBlockFlow, useBlockStatus } from '@/shared/hooks/blocks/useBlocks';
import { useCompanyDetails } from '@/shared/hooks/providers/useCompanyDetails';
import { useCompanyReport } from '@/shared/hooks/providers/useCompanyReport';
import { useCompanyReviews } from '@/shared/hooks/providers/useCompanyReviews';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function CompanyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const companyId =
    typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const [activeTab, setActiveTab] = useState<CompanyTab>('about');

  // Modal references
  const addReviewSheetRef = useRef<BottomSheetModal>(null);
  // A review, a report or a block needs an account: a guest gets the
  // sign-in sheet instead
  const { guardAction, authSheetRef } = useAuthGuard();
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const quoteModalRef = useRef<BottomSheetModal>(null);

  // Data & Business Logic Hooks (Separation of Concerns)
  const { company, isLoading, services, projects, targetUserId } =
    useCompanyDetails(companyId);
  // Its live stories, as a ring on the logo (company.id is the identity)
  const storyRing = useProviderStoryRing(company?.id);
  // Block / unblock the account behind the profile (not your own)
  const blockedByMe = useBlockStatus(company?.userId);
  const { askToBlock, askToUnblock } = useBlockFlow();
  const accountId = useAuthStore((state) => state.user?.id);
  const toggleBlock =
    company?.userId && company.userId !== accountId
      ? () =>
          blockedByMe
            ? askToUnblock(company.userId, company.name)
            : askToBlock(
                { userId: company.userId, identityId: company.id },
                company.name,
              )
      : undefined;
  // The account's own company: its quote button doesn't respond
  const currentUserId = useAuthStore((state) => state.user?.id);

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
  } = useCompanyReviews(targetUserId, Boolean(company));

  const { reportSheetRef, handleOpenReport, handleSubmitReport } =
    useCompanyReport(targetUserId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* Navigation Bar */}
        <CompanyNavBar
          onBack={() => router.back()}
          // Reporting and blocking need an account: a guest gets the
          // sign-in sheet instead
          onOpenReport={() => guardAction(handleOpenReport)}
          onToggleBlock={toggleBlock && (() => guardAction(toggleBlock))}
          blocked={!!blockedByMe}
        />

        {isLoading ? (
          <CompanyDetailSkeleton />
        ) : !company ? (
          <View className="flex-1 items-center justify-center p-5">
            <Text className="font-cairo-bold text-base text-[#111111]">
              لم يتم العثور على الشركة
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
              <CompanyHeaderCard company={company} logoRing={storyRing} />
              {/* المميزة: its highlights, kept past their 24 hours */}
              <ProfileHighlights authorId={company?.id} />

              {/* Tab Navigation Switcher */}
              <CompanyTabsSwitcher
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Tab Contents */}
              {activeTab === 'about' && (
                <CompanyAboutTab
                  reviewSummary={reviewSummary}
                  reviews={reviews}
                  displayedReviews={displayedReviews}
                  visibleReviewsCount={visibleReviewsCount}
                  onOpenSort={() => sortSheetRef.current?.present()}
                  onOpenAddReview={() =>
                    guardAction(() => addReviewSheetRef.current?.present())
                  }
                  onToggleLike={handleToggleLike}
                  onToggleDislike={handleToggleDislike}
                  onShowMoreReviews={handleShowMoreReviews}
                  workingHours={company?.workingHours}
                />
              )}

              {activeTab === 'services' && (
                <CompanyServicesTab services={services} />
              )}

              {activeTab === 'gallery' && (
                <CompanyGalleryTab projects={projects} />
              )}
            </View>
          </ScrollView>
        )}

        {/* Fixed Bottom Quote Request Action Bar; a company without an
            active subscription can't receive requests */}
        {company?.acceptsRequests !== false && (
          <CompanyBottomBar
            // A guest is asked to sign in first (QA): the form needs an account
            onRequestQuote={() =>
              guardAction(() => quoteModalRef.current?.present())
            }
            disabled={!!currentUserId && company?.userId === currentUserId}
          />
        )}

        {/* Coordinated Modals & Bottom Sheets */}
        <CompanyModals
          addReviewSheetRef={addReviewSheetRef}
          sortSheetRef={sortSheetRef}
          quoteModalRef={quoteModalRef}
          reportSheetRef={reportSheetRef}
          companyName={company?.name || ''}
          companySubtitle={company?.bio}
          companyLogoUrl={company?.logoUrl}
          services={services}
          servicesLoading={isLoading}
          targetIdentityId={company?.id}
          reviewSort={reviewSort}
          onSelectSort={setReviewSort}
          onAddReview={handleAddReview}
          onSubmitReport={handleSubmitReport}
        />
        <AuthGuardSheet ref={authSheetRef} />
      </ContentContainer>
    </SafeAreaView>
  );
}
