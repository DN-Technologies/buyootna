import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface Profile {
  id: string;
  name: string;
  email: string;
  type: 'individual' | 'company' | 'owner';
  typeName: string;
  icon: any;
}

interface ProfileBottomSheetProps {
  profiles: Profile[];
  selectedId?: string;
  onSelect: (profile: Profile) => void;
  onAddAccount: () => void;
}

const ProfileBottomSheet = forwardRef<
  BottomSheetModal,
  ProfileBottomSheetProps
>(({ profiles, selectedId, onSelect, onAddAccount }, ref) => {
  const snapPoints = useMemo(() => ['65%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="p-1"
          >
            <Feather name="x" size={24} color="#111111" />
          </TouchableOpacity>

          <View className="items-end">
            <Text className="mb-0.5 font-cairo-bold text-xl text-charcoal">
              اختر الملف الشخصي
            </Text>
            <Text className="font-cairo-medium text-xs text-gray-medium">
              يمكنك التبديل بين الملفات لاحقاً من الإعدادات
            </Text>
          </View>
        </View>

        {/* Profiles List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="mb-6 flex-1"
        >
          {profiles.map((profile) => {
            const isSelected = profile.id === selectedId;
            return (
              <TouchableOpacity
                key={profile.id}
                activeOpacity={0.8}
                onPress={() => {
                  onSelect(profile);
                  handleClose();
                }}
                className={`mb-3 flex-row items-center rounded-2xl px-4 py-3.5 ${
                  isSelected ? 'bg-primary' : 'border border-gray-100 bg-white'
                }`}
              >
                {/* Tag (Far Left) */}
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
                    {profile.typeName}
                  </Text>
                </View>

                {/* Info (Right Aligned) */}
                <View className="mr-4 flex-1 items-end">
                  <Text
                    className={`font-cairo-bold text-[17px] ${
                      isSelected ? 'text-white' : 'text-charcoal'
                    }`}
                  >
                    {profile.name}
                  </Text>
                  <Text
                    className={`-mt-1 font-cairo-medium text-[13px] ${
                      isSelected ? 'text-white/80' : 'text-gray-medium'
                    }`}
                  >
                    {profile.email}
                  </Text>
                </View>

                {/* Icon (Far Right) */}
                <View
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    isSelected ? 'bg-white' : 'bg-accent'
                  }`}
                >
                  <Image
                    source={profile.icon}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Add Account Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddAccount}
          style={{ height: 50, borderRadius: 24 }}
          className="w-full flex-row items-center justify-center border border-primary"
        >
          <Text
            className="font-cairo-bold text-sm text-primary"
            style={{
              paddingTop: Platform.OS === 'ios' ? 4 : 0,
              fontSize: 14,
            }}
          >
            اضافة حساب جديد
          </Text>
          <View style={{ width: 8 }} />
          <Feather
            name="plus"
            size={18}
            color="#15304D"
            className="relative -top-[3px]"
          />
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

ProfileBottomSheet.displayName = 'ProfileBottomSheet';

export default ProfileBottomSheet;
