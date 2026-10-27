import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CompanyIcon, IndividualIcon, OwnerIcon } from '@/assets/icons/account';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { SafeImage as Image } from '@/shared/components/ui/SafeImage';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { Identity, IdentityType } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

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

    // Active identity first; the rest keep their order (sort is stable)
    const orderedIdentities = useMemo(
      () =>
        [...identities].sort(
          (a, b) =>
            Number(b.id === activeIdentity?.id) -
            Number(a.id === activeIdentity?.id),
        ),
      [identities, activeIdentity?.id],
    );

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

      // Straight to the new profile's home: it shows its loading state while
      // the switch completes (its requests wait for the new token), instead
      // of a spinner here for the whole round trip
      const previousType = activeIdentity?.type;
      setSwitchingId(identity.id);
      const switching = switchIdentity(identity.id);
      handleClose();
      resetToIdentityHome(identity.type);
      try {
        await switching;
      } catch (error) {
        console.error('Failed to switch identity:', error);
        // The previous profile is back: so is its home
        resetToIdentityHome(previousType);
        showAlert('تعذر تبديل الهوية', 'تحقق من الاتصال وحاول مرة أخرى');
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
        <SafeBottomSheetView className="flex-1 px-6 pb-10 pt-2">
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
            {orderedIdentities.map((identity) => {
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
                      <>
                        {identity.type === 'INDIVIDUAL' && <IndividualIcon size={24} />}
                        {identity.type === 'COMPANY' && <CompanyIcon size={24} />}
                        {identity.type === 'OFFICE' && <OwnerIcon size={24} />}
                      </>
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
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  }
);

ProfileBottomSheet.displayName = 'ProfileBottomSheet';

export default ProfileBottomSheet;
