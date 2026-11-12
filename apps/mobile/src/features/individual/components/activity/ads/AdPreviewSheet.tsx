import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { activeFeatureLabel } from '@/features/individual/components/activity/ads/featuredState';
import { formatAdDate } from '@/features/individual/components/activity/ads/formatAdDate';
import PropertyImageCarousel from '@/features/individual/components/property-details-sheet/PropertyImageCarousel';
import { ActivityItem } from '@/shared/hooks/properties/useMyActivity';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
  publishedDate,
} from '@/shared/utils/helpers/property';

import AdPreviewActions from './ad-preview/AdPreviewActions';
import AdPreviewDetails from './ad-preview/AdPreviewDetails';
import AdPreviewHeader from './ad-preview/AdPreviewHeader';
import AdPreviewPriceRow from './ad-preview/AdPreviewPriceRow';
import AdPreviewSpecs from './ad-preview/AdPreviewSpecs';
import AdPreviewStats from './ad-preview/AdPreviewStats';
import { useAdPreviewSwitch } from './ad-preview/useAdPreviewSwitch';

interface AdPreviewSheetProps {
  property?: ActivityItem;
  // 'draft': the switch publishes it. 'active': the switch shows / hides it
  variant?: 'draft' | 'active';
  onClose?: () => void;
  onDeletePress?: () => void;
  onEditPress?: () => void;
  onFeaturePress?: (propertyId: string) => void;
  onSharePress?: () => void;
  onToggleVisibility?: (propertyId: string, hide: boolean) => void;
  onPublishPress?: (propertyId: string) => Promise<void>;
  // Offices: «تم البيع» / «تم التأجير» / «تمت المبادلة» on a live ad
  markDoneLabel?: string;
  onMarkDonePress?: (propertyId: string) => void;
}

const NO_IMAGE = require('@/assets/images/no-image.png');

/**
 * One of my ads in full, from نشاطي or the office's عقارات: photos, price,
 * specs, details and stats, with its actions. The parts live in ad-preview/.
 */
const AdPreviewSheet = forwardRef<BottomSheetModal, AdPreviewSheetProps>(
  (
    {
      property,
      variant = 'draft',
      onClose,
      onDeletePress,
      onEditPress,
      onFeaturePress,
      onSharePress,
      onToggleVisibility,
      onPublishPress,
      markDoneLabel,
      onMarkDonePress,
    },
    ref,
  ) => {
    // 85% of the screen: room for the whole ad
    const snapPoints = useMemo(() => ['85%'], []);
    const insets = useSafeAreaInsets();

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
      // @ts-ignore
      ref.current?.dismiss();
      if (onClose) onClose();
    };

    const { isOn, toggle } = useAdPreviewSwitch({
      property,
      variant,
      onToggleVisibility,
      onPublishPress,
      onPublished: handleClose,
    });

    if (!property) return null;

    // "شقة للبيع" or "عقار تجاري للبيع"
    const title = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type as any)}`;
    // Close the sheet, then act
    const closeThen = (action?: () => void) => () => {
      handleClose();
      action?.();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        {/* Outside the scroll, so it stays put */}
        <AdPreviewHeader
          title={title}
          isOn={isOn}
          onTogglePress={toggle}
          onSharePress={onSharePress}
          onClosePress={handleClose}
        />

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          // Keep the action row clear of the home indicator / nav bar
          contentContainerStyle={{ paddingBottom: insets.bottom }}
        >
          {/* All uploaded images, swipeable */}
          <View className="px-6 my-4">
            <PropertyImageCarousel
              images={property.images?.length ? property.images : [NO_IMAGE]}
              isFeatured={!!property.isPremium}
            />
          </View>

          <AdPreviewPriceRow
            price={property.price}
            date={formatAdDate(publishedDate(property) ?? property.updatedAt)}
          />
          <AdPreviewSpecs property={property} />
          <AdPreviewDetails property={property} />
          <AdPreviewStats property={property} />

          <AdPreviewActions
            onEditPress={closeThen(() => {
              router.push(`/edit-listing/${property.id}`);
              onEditPress?.();
            })}
            onFeaturePress={closeThen(() => onFeaturePress?.(property.id))}
            onDeletePress={closeThen(onDeletePress)}
            featuredLabel={activeFeatureLabel(property)}
            markDoneLabel={markDoneLabel}
            onMarkDonePress={
              onMarkDonePress && property.status === 'ACTIVE'
                ? closeThen(() => onMarkDonePress(property.id))
                : undefined
            }
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

AdPreviewSheet.displayName = 'AdPreviewSheet';

export default AdPreviewSheet;
