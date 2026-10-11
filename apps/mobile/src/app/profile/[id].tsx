import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddReviewSheet from '@/shared/components/profile/AddReviewSheet';
import {
  FilterBottomSheet,
  SortBottomSheet,
} from '@/shared/components/profile/ProfileFilterSheet';
import ProfileHeader from '@/shared/components/profile/ProfileHeader';
import ProfileListingsTab from '@/shared/components/profile/ProfileListingsTab';
import ProfileNavBar from '@/shared/components/profile/ProfileNavBar';
import ProfileReviewsTab from '@/shared/components/profile/ProfileReviewsTab';
import PropertyActionBar from '@/shared/components/property/PropertyActionBar';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useProfileContact } from '@/shared/hooks/providers/useProfileContact';
import { useUserProfile } from '@/shared/hooks/auth/useUserProfile';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const idStr = String(id);
  const insets = useSafeAreaInsets();

  // Screen UI State
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [propertySort, setPropertySort] = useState('all');

  // Bottom Sheet Modal Refs
  const addReviewSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);

  // Data & Query Management Hook
  const {
    userProfile,
    isLoadingProfile,
    properties,
    isLoadingProperties,
    reviews,
    reviewSummary,
    isOwnProfile,
    handleReviewSubmit,
    handleToggleLike,
    handleToggleDislike,
  } = useUserProfile({ id: idStr, sort: propertySort });

  // Contact Handlers Hook
  const { handleWhatsapp, handleCall, handleChat } =
    useProfileContact(userProfile);

  const renderHeader = () => (
    <ProfileHeader
      isLoadingProfile={isLoadingProfile}
      userProfile={userProfile}
      propertiesCount={properties.length}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onOpenFilter={() => filterSheetRef.current?.present()}
      reviewSummary={reviewSummary}
      onAddReview={() => addReviewSheetRef.current?.present()}
      onOpenSort={() => sortSheetRef.current?.present()}
      isOwnProfile={isOwnProfile}
    />
  );

  return (
    <View className="flex-1 bg-white">
      <ContentContainer className="flex-1">
        {/* Top Navigation Bar */}
        <ProfileNavBar />

        {/* Tab Views */}
        {activeTab === 'listings' ? (
          <ProfileListingsTab
            properties={properties}
            viewMode={viewMode}
            isLoading={isLoadingProperties}
            bottomInset={insets.bottom}
            renderHeader={renderHeader}
          />
        ) : (
          <ProfileReviewsTab
            reviews={reviews}
            sort={propertySort}
            bottomInset={insets.bottom}
            renderHeader={renderHeader}
            onToggleLike={handleToggleLike}
            onToggleDislike={handleToggleDislike}
          />
        )}

        {/* Fixed Bottom Action Bar */}
        {userProfile && !isOwnProfile && (
          <ContentContainer className="absolute bottom-0 z-50 w-full bg-white">
            <PropertyActionBar
              insets={insets}
              onWhatsapp={handleWhatsapp}
              onCall={handleCall}
              onChat={handleChat}
            />
          </ContentContainer>
        )}

        {/* Bottom Modals */}
        <AddReviewSheet
          ref={addReviewSheetRef}
          onSubmit={handleReviewSubmit}
        />
        <FilterBottomSheet
          ref={filterSheetRef}
          selectedValue={propertyFilter}
          onSelect={setPropertyFilter}
        />
        <SortBottomSheet
          ref={sortSheetRef}
          selectedValue={propertySort}
          onSelect={setPropertySort}
        />
      </ContentContainer>
    </View>
  );
}
