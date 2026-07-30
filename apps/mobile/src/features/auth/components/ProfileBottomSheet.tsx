import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useIdentity } from '@/hooks/useIdentity';
import { Identity, IdentityType } from '@/store/useAuthStore';

interface ProfileBottomSheetProps {
  onAddAccount: () => void;
}

const ProfileBottomSheet = forwardRef<BottomSheetModal, ProfileBottomSheetProps>(
  ({ onAddAccount }, ref) => {
    const snapPoints = useMemo(() => ['65%'], []);
    const [switchingId, setSwitchingId] = useState<string | null>(null);

    const {
      activeIdentity,
      identities,
      switchIdentity,
      getDisplayName,
      getAvatarUrl,
      getTypeLabel,
      getTypeBadgeColor,
    } = useIdentity();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleSelect = async (identity: Identity) => {
      if (identity.id === activeIdentity?.id) {
        handleClose();
        return;
      }

      try {
        setSwitchingId(identity.id);
        await switchIdentity(identity.id);
        handleClose();
      } catch (error) {
        console.error('Failed to switch identity:', error);
        // TODO: Show error toast
      } finally {
        setSwitchingId(null);
      }
    };

    const getIdentityIcon = (type: IdentityType): any => {
      switch (type) {
        case 'INDIVIDUAL':
          return require('@/assets/icons/individual-icon.svg');
        case 'COMPANY':
          return require('@/assets/icons/company-icon.svg');
        case 'OFFICE':
          return require('@/assets/icons/owner-icon.svg');
        default:
          return require('@/assets/icons/individual-icon.svg');
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 32 }}
      >
        <BottomSheetView className="flex-1 px-6 pb-10 pt-2">
          {/* Header */}
          <View className="mb-6 flex-row items-start justify-between">
            <View>
              <Text
                className="mb-0.5 font-cairo-semibold text-lg text-charcoal"
                style={{ writingDirection: 'rtl' }}
              >
                اختر الهوية
              </Text>
              <Text className="font-cairo-medium text-xs text-gray-medium">
                يمكنك التبديل بين الهويات أو إضافة هوية جديدة
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              className="p-1"
            >
              <Feather name="x" size={24} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Identities List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mb-6 flex-1"
          >
            {identities.map((identity) => {
              const isSelected = identity.id === activeIdentity?.id;
              const isSwitching = switchingId === identity.id;
              const displayName = getDisplayName(identity);
              const avatarUrl = getAvatarUrl(identity);
              const typeLabel = getTypeLabel(identity.type);

              return (
                <TouchableOpacity
                  key={identity.id}
                  activeOpacity={0.8}
                  disabled={isSwitching || switchingId !== null}
                  onPress={() => handleSelect(identity)}
                  className={`mb-3 flex-row items-center rounded-2xl px-4 py-3.5 ${
                    isSelected ? 'bg-primary' : 'border border-gray-100 bg-white'
                  }`}
                >
                  {/* Avatar/Icon (Far Right) */}
                  <View
                    className={`h-11 w-11 items-center justify-center overflow-hidden rounded-full ${
                      isSelected ? 'bg-white' : 'bg-accent'
                    }`}
                  >
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={{ width: 44, height: 44 }}
                        contentFit="cover"
                      />
                    ) : (
                      <RNImage
                        source={getIdentityIcon(identity.type)}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  {/* Info (Right Aligned) */}
                  <View className="ml-4 flex-1">
                    <Text
                      className={`font-cairo-bold text-[16px] ${
                        isSelected ? 'text-white' : 'text-charcoal'
                      }`}
                      style={{ writingDirection: 'rtl' }}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    <Text
                      className={`-mt-1 font-cairo-medium text-[12px] ${
                        isSelected ? 'text-white/80' : 'text-gray-medium'
                      }`}
                      style={{ writingDirection: 'rtl' }}
                    >
                      {isSelected ? 'الهوية النشطة' : 'انقر للتبديل'}
                    </Text>
                  </View>

                  {/* Tag or Loading Indicator (Far Left) */}
                  {isSwitching ? (
                    <ActivityIndicator
                      size="small"
                      color={isSelected ? '#FFFFFF' : '#15304D'}
                    />
                  ) : (
                    <View
                      className={`rounded-full px-3.5 py-1 ${
                        isSelected ? 'bg-white' : 'bg-accent'
                      }`}
                    >
                      <Text
                        className={`font-cairo-semibold text-xs ${
                          isSelected ? 'text-primary' : 'text-charcoal'
                        }`}
                        style={{ paddingTop: Platform.OS === 'ios' ? 4 : 0 }}
                      >
                        {typeLabel}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Add Identity Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              handleClose();
              onAddAccount();
            }}
            style={{ height: 50, borderRadius: 24 }}
            className="w-full flex-row items-center justify-center gap-2 border border-primary"
          >
            <View style={{ width: 8 }} />
            <Feather
              name="plus"
              size={18}
              color="#15304D"
              className="relative -top-[3px]"
            />
            <Text
              className="font-cairo-bold text-sm text-primary"
              style={{
                paddingTop: Platform.OS === 'ios' ? 4 : 0,
                fontSize: 14,
              }}
            >
              إضافة هوية جديدة
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ProfileBottomSheet.displayName = 'ProfileBottomSheet';

export default ProfileBottomSheet;
