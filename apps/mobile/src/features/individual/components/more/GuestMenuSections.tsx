import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AuctionsIcon, ChatIcon, DealsIcon, SavedIcon } from '@/assets/icons/more';
import MenuItem from '@/shared/components/ui/MenuItem';
import { FEATURES } from '@/shared/config/features';
import { showAlert } from '@/shared/utils/alert';

import MenuSection from './MenuSection';
import {
  BellIcon,
  FileIcon,
  HelpIcon,
  InfoIcon,
  PhoneIcon,
  ShieldIcon,
} from './moreScreenIcons';

interface GuestMenuSectionsProps {
  guardAction: (action: () => void) => void;
}

/** The More screen's menu sections for a logged-out guest -- activity/chat
 * actions are gated behind guardAction (prompts login), support/policy
 * links are not. */
export default function GuestMenuSections({
  guardAction,
}: GuestMenuSectionsProps) {
  const router = useRouter();

  return (
    <View className="gap-6 px-5">
      <MenuSection title="نشاطي">
        <MenuItem
          icon={ChatIcon}
          title="المحادثات"
          onPress={() => guardAction(() => router.push('/chat'))}
        />
        <MenuItem
          icon={SavedIcon}
          title="المحفوظات"
          onPress={() => guardAction(() => router.push('/favorites'))}
        />
        <MenuItem
          icon={BellIcon}
          title="الاشعارات"
          onPress={() =>
            guardAction(() => router.push('/notification-list'))
          }
        />
      </MenuSection>

      {/* الصفقات and المزادات come later (shared/config/features.ts) */}
      {(FEATURES.deals || FEATURES.auctions) && (
        <MenuSection title="الخدمات">
          {FEATURES.deals && (
            <MenuItem
              icon={DealsIcon}
              title="الصفقات"
              onPress={() =>
                showAlert('قريباً', 'ميزة الصفقات ستكون متوفرة قريباً')
              }
            />
          )}
          {FEATURES.auctions && (
            <MenuItem
              icon={AuctionsIcon}
              title="المزادات"
              onPress={() =>
                showAlert('قريباً', 'ميزة المزادات ستكون متوفرة قريباً')
              }
            />
          )}
        </MenuSection>
      )}

      <MenuSection title="الدعم والمساعدة">
        <MenuItem
          icon={InfoIcon}
          title="عن بيوتنا"
          onPress={() => router.push('/about')}
        />
        <MenuItem
          icon={HelpIcon}
          title="الأسئلة الشائعة"
          onPress={() => router.push('/faq')}
        />
        <MenuItem
          icon={PhoneIcon}
          title="تواصل معنا"
          onPress={() => router.push('/contact')}
        />
      </MenuSection>

      <MenuSection title="السياسات">
        <MenuItem
          icon={ShieldIcon}
          title="سياسة الخصوصية"
          onPress={() => router.push('/privacy')}
        />
        <MenuItem
          icon={FileIcon}
          title="الشروط والأحكام"
          onPress={() => router.push('/terms')}
        />
      </MenuSection>
    </View>
  );
}
