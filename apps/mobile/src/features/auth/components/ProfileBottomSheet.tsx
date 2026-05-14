import React, { forwardRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

export interface Profile {
  id: string;
  name: string;
  email: string;
  type: "individual" | "company" | "owner";
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
  const snapPoints = useMemo(() => ["65%"], []);

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
    if (ref && "current" in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#111111", width: 40 }}
      backgroundStyle={{ backgroundColor: "#FFFFFF", borderRadius: 32 }}
    >
      <BottomSheetView className="flex-1 px-6 pb-10 pt-2">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="p-1"
          >
            <Feather name="x" size={24} color="#111111" />
          </TouchableOpacity>

          <View className="items-end">
            <Text className="text-xl font-cairo-bold text-charcoal mb-0.5">
              اختر الملف الشخصي
            </Text>
            <Text className="text-xs font-cairo-medium text-gray-medium">
              يمكنك التبديل بين الملفات لاحقاً من الإعدادات
            </Text>
          </View>
        </View>

        {/* Profiles List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 mb-6"
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
                className={`flex-row items-center px-4 py-3.5 rounded-2xl mb-3 ${
                  isSelected ? "bg-primary" : "bg-white border border-gray-100"
                }`}
              >
                {/* Tag (Far Left) */}
                <View
                  className={`px-3.5 py-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-accent"
                  }`}
                >
                  <Text
                    className={`text-xs font-cairo-semibold ${
                      isSelected ? "text-primary" : "text-charcoal"
                    }`}
                    style={{ paddingTop: Platform.OS === "ios" ? 4 : 0 }}
                  >
                    {profile.typeName}
                  </Text>
                </View>

                {/* Info (Right Aligned) */}
                <View className="flex-1 items-end mr-4">
                  <Text
                    className={`text-[17px] font-cairo-bold ${
                      isSelected ? "text-white" : "text-charcoal"
                    }`}
                  >
                    {profile.name}
                  </Text>
                  <Text
                    className={`text-[13px] font-cairo-medium -mt-1 ${
                      isSelected ? "text-white/80" : "text-gray-medium"
                    }`}
                  >
                    {profile.email}
                  </Text>
                </View>

                {/* Icon (Far Right) */}
                <View
                  className={`w-11 h-11 rounded-full items-center justify-center ${
                    isSelected ? "bg-white" : "bg-accent"
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
          className="w-full border  border-primary flex-row items-center justify-center"
        >
          <Text
            className="text-sm font-cairo-bold text-primary"
            style={{
              paddingTop: Platform.OS === "ios" ? 4 : 0,
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
            className=" relative -top-[3px]"
          />
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

ProfileBottomSheet.displayName = "ProfileBottomSheet";

export default ProfileBottomSheet;
