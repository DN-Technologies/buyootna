import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function EmptyChatState() {
  const router = useRouter();

  return (
    <View className="mt-20 flex-1 items-center justify-center px-8">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-gray-50">
        <Feather name="message-square" size={32} color="#111111" />
      </View>

      <Text className="mb-2 text-center font-cairo-bold text-lg text-[#111111]">
        لا توجد محادثات حالياً
      </Text>

      <Text className="mb-8 text-center font-cairo-medium text-sm leading-6 text-[#64748B]">
        ابدأ بإضافة العقارات أو الشركات التي تهمك للرجابداً بالتواصل مع المعلنين
        أو الشركات هنا لاحقاً.
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/explore')}
        className="w-full items-center justify-center rounded-xl bg-[#15304D] py-4"
      >
        <Text className="font-cairo-bold text-[15px] text-white">
          استكشف الآن
        </Text>
      </TouchableOpacity>
    </View>
  );
}
