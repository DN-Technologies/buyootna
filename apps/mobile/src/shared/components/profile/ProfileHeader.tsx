import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import ProfileHeaderCard from '@/shared/components/profile/ProfileHeaderCard';
import ProfileTabNavigation from '@/shared/components/profile/ProfileTabNavigation';
import ReviewsSummarySection from '@/shared/components/profile/ReviewsSummarySection';
import { ReviewSummary, UserProfile } from '@/shared/components/profile/types';
import PublicProfileHeaderSkeleton from '@/shared/components/skeletons/PublicProfileHeaderSkeleton';

interface ProfileHeaderProps {
  isLoadingProfile: boolean;
  userProfile?: UserProfile;
  propertiesCount: number;
  activeTab: 'listings' | 'reviews';
  onTabChange: (tab: 'listings' | 'reviews') => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  onOpenFilter: () => void;
  reviewSummary: ReviewSummary;
  onAddReview: () => void;
  onOpenSort: () => void;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  isLoadingProfile,
  userProfile,
  propertiesCount,
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  onOpenFilter,
  reviewSummary,
  onAddReview,
  onOpenSort,
  isOwnProfile,
}: ProfileHeaderProps) {
  if (isLoadingProfile || !userProfile) {
    return <PublicProfileHeaderSkeleton />;
  }

  return (
    <View className="mb-4">
      {/* Modular Header Card */}
      <ProfileHeaderCard
        userProfile={userProfile}
        propertiesCount={propertiesCount}
      />

      {/* Modular Navigation Tabs */}
      <ProfileTabNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Tab-specific Controls: Listings Toolbar */}
      {activeTab === 'listings' && propertiesCount > 0 && (
        <View className="mt-4 flex-row items-center justify-between px-5">
          <View className="flex-row items-center gap-1 rounded-xl bg-[#F5F7F9] p-1">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onViewModeChange('list')}
              className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
                viewMode === 'list' ? 'bg-[#15304D]' : 'bg-transparent'
              }`}
            >
              <Feather
                name="list"
                color={viewMode === 'list' ? '#FFFFFF' : '#6B6A6A'}
                size={14}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onViewModeChange('card')}
              className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
                viewMode === 'card' ? 'bg-[#15304D]' : 'bg-transparent'
              }`}
            >
              <Feather
                name="grid"
                color={viewMode === 'card' ? '#FFFFFF' : '#6B6A6A'}
                size={14}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenFilter}
            className="flex-row items-center gap-1.5"
          >
            <Feather name="sliders" size={16} color="#6B6A6A" />
            <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
              تصفية
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab-specific Controls: Reviews Summary */}
      {activeTab === 'reviews' && (
        <ReviewsSummarySection
          onAddReview={onAddReview}
          onSortPress={onOpenSort}
          averageRating={reviewSummary.averageRating}
          totalRatingsCount={reviewSummary.totalRatingsCount}
          ratingBreakdown={reviewSummary.ratingBreakdown}
          isOwnProfile={isOwnProfile}
        />
      )}
    </View>
  );
}
