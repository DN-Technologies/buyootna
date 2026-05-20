import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";


interface GuestFallbackProps {
    title: string;
    message: string;
    icon?: keyof typeof Feather.glyphMap;
}


export default function GuestFallback({
    title, message, icon = 'lock'
}: GuestFallbackProps){
    return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center px-6">
      <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6">
        <Feather name={icon} size={32} color="#0B2239" />
      </View>
      
      <Text className="text-2xl font-cairo-bold text-[#111111] mb-2 text-center">
        {title}
      </Text>
      <Text className="text-base text-[#6B6A6A] font-cairo-semibold text-center leading-6 mb-8 px-4">
        {message}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/(auth)/selection')}
        className="w-full py-4 rounded-3xl items-center justify-center bg-[#0B2239]"
      >
        <Text className="text-lg font-cairo-bold text-white">تسجيل الدخول أو إنشاء حساب</Text>
      </TouchableOpacity>
    </View>
  );
}