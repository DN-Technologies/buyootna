import React, { useRef } from "react";
import { View, Button } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { AccountType } from "@/types";
import AccountTypeBottomSheet from "@/components/AccountTypeBottomSheet";

export default function CompanyRegister() {
  const router = useRouter();

  // 1. Create the ref
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // 2. Define what happens when they pick an option
  const handleAccountTypeSelected = (type: AccountType) => {
    if (type === "individual") {
      router.push("/(auth)/individual-register");
    } else if (type === "company") {
      router.push("/(auth)/company-register");
    }
  };

  return (
    <View
      className="flex-1 bg-white justify-center items-center"
      style={{ paddingTop: 100 }}
    >
      <View className="flex-1 justify-center items-center">
        {/* Button that opens the sheet */}
        <Button
          title="Open Selection Sheet"
          onPress={() => bottomSheetRef.current?.present()}
        />

        {/* The Sheet Component (hidden by default) */}
        <AccountTypeBottomSheet
          ref={bottomSheetRef}
          onContinue={handleAccountTypeSelected}
        />
      </View>
    </View>
  );
}
