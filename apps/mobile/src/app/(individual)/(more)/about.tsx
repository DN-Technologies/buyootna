import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BuyootnaLogo, CompanyLogo } from '@/assets/icons';
import { useTabBarHeight } from '@/shared/hooks/useTabBarHeight';

const appVersion = Constants.expoConfig?.version;

export default function AboutScreen() {
  const router = useRouter();
  const { scrollContentBottomPadding } = useTabBarHeight();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          عن بيوتنا
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: scrollContentBottomPadding,
        }}
      >
        {/* --- Buyootna Section --- */}
        <View className="mb-6 items-center">
          <BuyootnaLogo width={140} height={75} />
        </View>

        <View className="mb-8 gap-5">
          <Text
            className="font-cairo text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            تطبيق بيوتنا هو منصتك العقارية الموثوقة والذكية، المصممة خصيصاً
            لتغيير تجربة البحث عن العقارات وتسهيلها. نحن لسنا مجرد دليل عقاري،
            بل نحن حلقة الوصل الأكثر أماناً وسرعة بين الباحثين عن العقار،
            والملاك، والمكاتب المعتمدة.
          </Text>

          <Text
            className="font-cairo text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            رؤيتنا أن نصبح الخيار الأول والمنصة الأكثر كفاءة وموثوقية في السوق
            العقاري، من خلال تقديم تجربة رقمية سلسة تعتمد على الابتكار
            والشفافية.
          </Text>

          <Text
            className="font-cairo text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            تمكين الأفراد والشركات من اتخاذ قرارات عقارية ذكية وناجحة، وتسهيل
            رحلة الشراء، البيع، والإيجار بأقل خطوات وبأعلى معايير الأمان البصري
            والتقني.
          </Text>
        </View>

        {/* --- Divider --- */}
        <View className="mb-6 items-center">
          <Text className="font-cairo-medium text-sm text-[#A0A0A0]">
            تم انشاء وتطوير التطبيق بواسطة دار النخبة
          </Text>
        </View>

        {/* --- Company Section --- */}
        <View className="mb-6 items-center">
          <CompanyLogo width={120} height={60} />
        </View>

        <View className="gap-5">
          <Text
            className="font-cairo text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            تأسست دار النخبة للدعاية والتسويق كشركة تقنية كويتية رائدة متخصصة في
            هندسة وبناء المنظومات الرقمية المتكاملة.
          </Text>

          <Text
            className="font-cairo text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            وهي تمثل الكيان والمحرك الأساسي خلف مجموعة من أبرز المنتجات والحلول
            الذكية في السوق المحلي مثل منصة &quot;بيوتنا&quot; العقارية، ومنصة
            &quot;لبسي&quot; للأزياء، وتطبيق &quot;قطية&quot; للخدمات المالية.
          </Text>

          <Text
            className="font-cairo text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            تستهدف الشركة قيادة الابتكار الرقمي في دولة الكويت عبر تقديم حلول
            مخصصة لكل قطاع بشكل مستقل (Vertical Solutions)، مبنية على جودة
            التصميم والفهم العميق لثقافة وبيئة المستخدم المحتسب، لبناء شراكات
            استراتيجية طويلة الأمد تضمن نمواً مستمراً وتواكب متطلبات السوق
            بمرونة واحترافية.
          </Text>
        </View>

        {/* --- App Version --- */}
        {!!appVersion && (
          <View className="mt-8 items-center">
            <Text className="font-cairo-medium text-xs text-[#A0A0A0]">
              الإصدار {appVersion}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
