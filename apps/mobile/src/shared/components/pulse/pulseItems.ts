import type { Feather } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import type { PulseItem, PulseTone } from '@/shared/api/pulse.service';
import type { IdentityType } from '@/shared/store/useAuthStore';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

export const PULSE_TONE_COLORS: Record<PulseTone, string> = {
  gold: '#C5A36D',
  amber: '#D97706',
  red: '#BA0003',
};

export interface PulseView {
  icon: FeatherName;
  // The notch: a number or a sign, never words (it's 16pt wide)
  short: string;
  // The quick view's row: what, and what to do about it
  title: string;
  subtitle: string;
  href: Href;
}

const activityTab = (tab: 'ads' | 'offers' | 'alerts'): Href => ({
  pathname: '/(individual)/activity',
  params: { tab },
});

// Where my ads are listed, per profile type
const myAdsHref = (identity: IdentityType): Href =>
  identity === 'OFFICE' ? '/(office)/office-properties' : activityTab('ads');

const companyRequest = (id: string | null): Href =>
  id ? (`/(company)/(requests)/${id}` as Href) : '/(company)/company-requests';

function inDays(days: number) {
  if (days <= 1) return 'غداً';
  if (days === 2) return 'خلال يومين';
  return `خلال ${days} أيام`;
}

function expiryTitle(count: number, daysLeft: number) {
  if (count > 1) return `${count} إعلانات تنتهي خلال أيام`;
  if (daysLeft === 0) return 'إعلانك ينتهي اليوم';
  if (daysLeft === 1) return 'إعلانك ينتهي غداً';
  if (daysLeft === 2) return 'إعلانك ينتهي خلال يومين';
  return `إعلانك ينتهي خلال ${daysLeft} أيام`;
}

const plus = (n: number) => (n > 9 ? '+9' : `+${n}`);

/**
 * What a pulse item says and where it goes, for the notch and quick view;
 * the profile type picks the screens.
 */
export function pulseView(
  item: PulseItem,
  identity: IdentityType = 'INDIVIDUAL',
): PulseView {
  const { count, refId } = item;
  switch (item.kind) {
    case 'requestOffers':
      return {
        icon: 'tag',
        short: plus(count),
        title: count === 1 ? 'عرض جديد على طلبك' : `${count} عروض على طلباتك`,
        subtitle:
          count === 1 ? 'راجعه وردّ على الشركة' : 'راجعها واختر الأنسب لك',
        href: refId
          ? { pathname: '/request-details/[id]', params: { id: refId } }
          : activityTab('offers'),
      };
    case 'adExpiring': {
      const daysLeft = item.daysLeft ?? 0;
      return {
        icon: 'clock',
        short: daysLeft === 0 ? '!' : String(daysLeft),
        title: expiryTitle(count, daysLeft),
        subtitle: 'جدّده ليبقى ظاهراً للباحثين',
        href: myAdsHref(identity),
      };
    }
    case 'alertMatches':
      return {
        icon: 'home',
        short: plus(count),
        title:
          count === 1
            ? 'عقار جديد يطابق تنبيهك'
            : `${count} عقارات جديدة تطابق تنبيهاتك`,
        subtitle: count === 1 ? 'شاهده قبل غيرك' : 'شاهدها قبل غيرك',
        href: refId
          ? (`/alert-matches/${refId}` as Href)
          : activityTab('alerts'),
      };
    case 'providerStory':
      return {
        icon: 'play-circle',
        short: count > 1 ? plus(count) : '',
        title:
          count === 1
            ? 'قصة جديدة من مفضلتك'
            : `${count} قصص جديدة من مفضلتك`,
        subtitle: 'شاهدها قبل أن تختفي',
        href: {
          pathname: '/stories/[authorId]',
          params: { authorId: refId ?? '', source: 'feed' },
        },
      };
    case 'privateRequests':
      return {
        icon: 'briefcase',
        short: plus(count),
        title:
          count === 1 ? 'طلب خاص بانتظار ردك' : `${count} طلبات خاصة بانتظار ردك`,
        subtitle: 'ردّ قبل أن يختار العميل غيرك',
        href: companyRequest(refId),
      };
    case 'billing': {
      const overdue = item.daysLeft === undefined;
      return {
        icon: overdue ? 'alert-circle' : 'calendar',
        short: overdue ? '!' : String(item.daysLeft),
        title: overdue
          ? 'اشتراكك يحتاج إلى تجديد'
          : `ينتهي اشتراكك ${inDays(item.daysLeft ?? 0)}`,
        subtitle: overdue
          ? 'جدّده لتبقى خدماتك ظاهرة للعملاء'
          : 'جدّده لتستمر دون انقطاع',
        href: '/company-plans' as Href,
      };
    }
    case 'offerAccepted':
      return {
        icon: 'check-circle',
        short: plus(count),
        title: count === 1 ? 'قبل العميل عرضك' : `قُبل ${count} من عروضك`,
        subtitle: 'تواصل مع العميل وابدأ العمل',
        href: companyRequest(refId),
      };
    case 'publicRequests':
      return {
        icon: 'inbox',
        short: plus(count),
        title:
          count === 1
            ? 'طلب عام جديد في تخصصك'
            : `${count} طلبات عامة جديدة في تخصصك`,
        subtitle: 'كن أول من يرد',
        href: companyRequest(refId),
      };
    case 'adCredits':
      return {
        icon: 'layers',
        short: String(count),
        title: count === 0 ? 'نفد رصيد إعلاناتك' : 'بقي إعلان واحد في رصيدك',
        subtitle: 'اشترِ باقة لتواصل النشر',
        href: '/plans',
      };
    case 'myStory': {
      const hours = item.hoursLeft ?? 0;
      return {
        icon: 'eye',
        short: count > 99 ? '99+' : String(count),
        title: `قصتك: ${count} مشاهدة`,
        subtitle:
          hours < 1 ? 'تنتهي خلال أقل من ساعة' : `تنتهي خلال ${hours} ساعة`,
        href: {
          pathname: '/stories/[authorId]',
          params: { authorId: refId ?? '', source: 'mine' },
        },
      };
    }
  }
}
