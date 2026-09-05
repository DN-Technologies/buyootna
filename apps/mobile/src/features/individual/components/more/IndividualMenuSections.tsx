import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AuctionsIcon,
  BillIcon,
  ChatIcon,
  DealsIcon,
  MoneyIcon,
  QuotaIcon,
  SavedIcon,
  SettingsIcon,
  StarIcon,
} from '@/assets/icons/more';
import { showAlert } from '@/shared/utils/alert';

import MenuItem from './MenuItem';
import MenuSection from './MenuSection';
import { BellIcon } from './moreScreenIcons';

interface IndividualMenuSectionsProps {
  unreadChatCount: number;
  unreadNotificationsCount: number;
}

/** The More screen's menu sections for a logged-in individual user. */
export default function IndividualMenuSections({
  unreadChatCount,
  unreadNotificationsCount,
}: IndividualMenuSectionsProps) {
  const router = useRouter();

  return (
    <View className="gap-6 px-5">
      <MenuSection title="نشاطي">
        <MenuItem
          icon={ChatIcon}
          title="المحادثات"
          badgeCount={unreadChatCount}
          onPress={() => router.push('/chat')}
        />
        <MenuItem
          icon={SavedIcon}
          title="المحفوظات"
          onPress={() => router.push('/favorites')}
        />
        <MenuItem
          icon={BellIcon}
          title="الاشعارات"
          badgeCount={unreadNotificationsCount}
          onPress={() => router.push('/notification-list')}
        />
      </MenuSection>

      <MenuSection title="الخدمات">
        <MenuItem
          icon={DealsIcon}
          title="الصفقات"
          onPress={() =>
            showAlert('قريباً', 'ميزة الصفقات ستكون متوفرة قريباً')
          }
        />
        <MenuItem
          icon={AuctionsIcon}
          title="المزادات"
          onPress={() =>
            showAlert('قريباً', 'ميزة المزادات ستكون متوفرة قريباً')
          }
        />
      </MenuSection>

      <MenuSection title="التقييمات">
        <MenuItem
          icon={StarIcon}
          title="التقييمات والمراجعات"
          onPress={() => router.push('/reviews')}
        />
      </MenuSection>

      <MenuSection title="الحساب والاشتراك">
        <MenuItem
          icon={QuotaIcon}
          title="الباقات"
          onPress={() => router.push('/plans')}
        />
        <MenuItem
          icon={MoneyIcon}
          title="رصيد الحساب"
          onPress={() => router.push('/account-balance')}
        />
        <MenuItem
          icon={BillIcon}
          title="الفواتير"
          onPress={() => router.push('/invoices')}
        />
        <MenuItem
          icon={BillIcon}
          title="فواتير الخدمات"
          onPress={() =>
            showAlert('قريباً', 'ميزة فواتير الخدمات ستكون متوفرة قريباً')
          }
        />
      </MenuSection>

      <MenuSection title="الإعدادات">
        <MenuItem
          icon={SettingsIcon}
          title="اعدادات الحساب"
          onPress={() => router.push('/settings')}
        />
      </MenuSection>
    </View>
  );
}
