import type { Feather } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import type { PulseItem, PulseTone } from '@/shared/api/pulse.service';

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

function expiryTitle(count: number, daysLeft: number) {
  if (count > 1) return `${count} إعلانات تنتهي خلال أيام`;
  if (daysLeft === 0) return 'إعلانك ينتهي اليوم';
  if (daysLeft === 1) return 'إعلانك ينتهي غداً';
  if (daysLeft === 2) return 'إعلانك ينتهي خلال يومين';
  return `إعلانك ينتهي خلال ${daysLeft} أيام`;
}

const plus = (n: number) => (n > 9 ? '+9' : `+${n}`);

/** What a pulse item says and where it goes, for the notch and quick view. */
export function pulseView(item: PulseItem): PulseView {
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
        href: activityTab('ads'),
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
  }
}
