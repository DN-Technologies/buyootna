import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CallIcon,
  DeviceIcon,
  HideAdIcon,
  HideIcon,
  InfoIcon,
  LockIcon,
  NotificationIcon,
  PrivacyIcon,
  ShowIcon,
  TermsIcon,
} from '@/assets/icons/settings';
import { settingsService } from '@/core/api/settings.service';
import MenuItem from '@/core/components/more/MenuItem';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // Privacy Toggle States
  const [showPhone, setShowPhone] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [hideActivity, setHideActivity] = useState(false);
  const [hideOfficeAds, setHideOfficeAds] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password Change Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (token) {
      loadSettings();
    }
  }, [token]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await settingsService.getSettings();
      setShowPhone(settings.showPhone);
      setShowWhatsapp(settings.showWhatsapp);
      setHideActivity(settings.hideActivity);
      setHideOfficeAds(settings.hideOfficeAds);
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleShowPhone = async (val: boolean) => {
    setShowPhone(val);
    try {
      await settingsService.updateSettings({ showPhone: val });
    } catch (e) {
      console.error('Failed to update showPhone:', e);
    }
  };

  const handleToggleShowWhatsapp = async (val: boolean) => {
    setShowWhatsapp(val);
    try {
      await settingsService.updateSettings({ showWhatsapp: val });
    } catch (e) {
      console.error('Failed to update showWhatsapp:', e);
    }
  };

  const handleToggleHideActivity = async (val: boolean) => {
    setHideActivity(val);
    try {
      await settingsService.updateSettings({ hideActivity: val });
    } catch (e) {
      console.error('Failed to update hideActivity:', e);
    }
  };

  const handleToggleHideOfficeAds = async (val: boolean) => {
    setHideOfficeAds(val);
    try {
      await settingsService.updateSettings({ hideOfficeAds: val });
    } catch (e) {
      console.error('Failed to update hideOfficeAds:', e);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب نهائياً',
      'هل أنت متأكد من رغبتك في حذف الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح جميع بياناتك.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.deleteAccount();
              await useAuthStore.getState().logout();
              router.replace('/(auth)/individual-auth');
            } catch (error) {
              console.error(error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف الحساب');
            }
          },
        },
      ],
    );
  };

  const handleDisableAccount = () => {
    Alert.alert(
      'تعطيل الحساب مؤقتاً',
      'هل تريد تعطيل حسابك مؤقتاً؟ يمكنك تسجيل الدخول مرة أخرى في أي وقت لتنشيطه.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تعطيل',
          onPress: async () => {
            try {
              await settingsService.disableAccount();
              await useAuthStore.getState().logout();
              router.replace('/(auth)/individual-auth');
            } catch (error) {
              console.error(error);
              Alert.alert('خطأ', 'حدث خطأ أثناء تعطيل الحساب');
            }
          },
        },
      ],
    );
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('تنبيه', 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل');
      return;
    }
    setIsChangingPass(true);
    try {
      await settingsService.changePassword(oldPassword, newPassword);
      Alert.alert('نجاح', 'تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert(
        'خطأ',
        error.response?.data?.message || 'فشل تغيير كلمة المرور',
      );
    } finally {
      setIsChangingPass(false);
    }
  };

  // Helper component for Switch rows
  const SettingsSwitchItem = ({
    icon: Icon,
    title,
    value,
    onValueChange,
  }: {
    icon: React.ComponentType<{ color?: string; size?: number }>;
    title: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between bg-[#F9FAFE] py-4">
      {/* Right Side (Icon & Title) */}
      <View className="flex-row items-center gap-2">
        <Icon color="#111111" size={22} />
        <Text className="font-cairo-medium text-[14px] text-[#111111]">
          {title}
        </Text>
      </View>

      {/* Left Side (Switch Toggle) */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#15304D' }}
        thumbColor="#FFFFFF"
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الإعدادات
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#15304D" className="py-20" />
        ) : (
          <View className="gap-6 px-5">
          {/* --- Section: Notifications --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الاشعارات
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={NotificationIcon}
                title="الإشعارات"
                onPress={() => router.push('/notifications')}
              />
            </View>
          </View>

          {/* --- Section: Account & Security --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الحساب والامان
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={LockIcon}
                title="تغيير كلمة المرور"
                onPress={() => setShowPasswordModal(true)}
              />
              <MenuItem
                icon={DeviceIcon}
                title="الاجهزة المسجلة"
                onPress={() => router.push('/devices')}
              />
            </View>
          </View>

          {/* --- Section: Privacy --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الخصوصية
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <SettingsSwitchItem
                icon={InfoIcon}
                title="اظهار رقم الهاتف"
                value={showPhone}
                onValueChange={handleToggleShowPhone}
              />
              <SettingsSwitchItem
                icon={ShowIcon}
                title="اظهار رقم الواتساب"
                value={showWhatsapp}
                onValueChange={handleToggleShowWhatsapp}
              />
              <SettingsSwitchItem
                icon={HideIcon}
                title="اخفاء النشاط"
                value={hideActivity}
                onValueChange={handleToggleHideActivity}
              />
              <SettingsSwitchItem
                icon={HideAdIcon}
                title="اخفاء اعلانات المكاتب"
                value={hideOfficeAds}
                onValueChange={handleToggleHideOfficeAds}
              />
            </View>
          </View>

          {/* --- Section: Support & Help --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الدعم والمساعدة
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={InfoIcon}
                title="عن بيوتنا"
                onPress={() => router.push('/about')}
              />
              <MenuItem
                icon={ShowIcon}
                title="الأسئلة الشائعة"
                onPress={() => router.push('/faq')}
              />
              <MenuItem
                icon={CallIcon}
                title="تواصل معنا"
                onPress={() => router.push('/contact')}
              />
            </View>
          </View>

          {/* --- Section: Policies --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              السياسات
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={PrivacyIcon}
                title="سياسة الخصوصية"
                onPress={() => router.push('/privacy')}
              />
              <MenuItem
                icon={TermsIcon}
                title="الشروط والأحكام"
                onPress={() => router.push('/terms')}
              />
            </View>
          </View>

          {/* --- Action Buttons --- */}
          <View className="mt-4 gap-3">
            {/* Delete Account */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white leading-[22px]"
            >
              <Feather name="user-x" size={18} color="#9C1E28" />
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#9C1E28]">
                حذف الحساب
              </Text>
            </TouchableOpacity>

            {/* Temporarily Disable Account */}
            <TouchableOpacity
              onPress={handleDisableAccount}
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#B97500] bg-white"
            >
              <Feather name="pause-circle" size={18} color="#B97500" />
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#B97500]">
                تعطيل الحساب مؤقتا
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <View className="w-full rounded-3xl bg-white p-6">
            <Text className="mb-4 text-center font-cairo-bold text-lg text-[#15304D]">
              تغيير كلمة المرور
            </Text>

            <View className="mb-4">
              <Text className="mb-1 text-right font-cairo-medium text-xs text-[#111111]">
                كلمة المرور القديمة
              </Text>
              <TextInput
                secureTextEntry
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right font-cairo-medium text-[#111111]"
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="أدخل كلمة المرور القديمة"
                textAlign="right"
              />
            </View>

            <View className="mb-6">
              <Text className="mb-1 text-right font-cairo-medium text-xs text-[#111111]">
                كلمة المرور الجديدة
              </Text>
              <TextInput
                secureTextEntry
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right font-cairo-medium text-[#111111]"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="أدخل كلمة المرور الجديدة"
                textAlign="right"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                disabled={isChangingPass}
                onPress={() => setShowPasswordModal(false)}
                className="flex-1 items-center justify-center rounded-full border border-gray-200 py-3"
              >
                <Text className="font-cairo-bold text-sm text-[#6B6A6A]">
                  إلغاء
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isChangingPass}
                onPress={handleChangePassword}
                className="flex-1 items-center justify-center rounded-full bg-[#15304D] py-3"
              >
                {isChangingPass ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="font-cairo-bold text-sm text-white">
                    حفظ
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
