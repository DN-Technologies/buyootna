import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  DimensionValue,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import PropertyCardImageCarousel from './property-card/PropertyCardImageCarousel';
import PropertyCardIncomeRow from './property-card/PropertyCardIncomeRow';
import PropertyCardInfoRow from './property-card/PropertyCardInfoRow';
import PropertyCardPriceRow from './property-card/PropertyCardPriceRow';

export interface PropertyCardProps {
  id: string;
  images: (string | number)[];
  price: number | string;
  companyName?: string;
  isFeatured?: boolean;
  type?: string; // e.g., 'سكني', 'تجاري', 'استثماري'
  categoryLabel?: string; // e.g., 'عمارة', 'شقة', 'فيلا', 'بيت', 'أرض'
  category?: string;
  area: number;
  beds?: number;
  baths?: number;
  location: string;
  timeAgo?: string;
  propertyIncome?: number | null;
  cardWidth?: DimensionValue;
  isFavorited?: boolean;
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function PropertyCard({
  id,
  images,
  price,
  isFeatured = false,
  type = 'سكني',
  categoryLabel,
  category,
  area,
  location,
  timeAgo = 'منذ ساعتين',
  propertyIncome,
  cardWidth = '100%',
  isFavorited = false,
  onPress,
  onFavorite,
  onShare,
}: PropertyCardProps) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const imageWidth =
    typeof cardWidth === 'number'
      ? cardWidth
      : measuredWidth || windowWidth - 40;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/property/${id}`);
    }
  };

  const displayImages =
    images && images.length > 0
      ? images
      : [require('@/assets/images/no-image.png')];

  return (
    <View
      testID={`property-card-root-${id}`}
      className="mb-5 w-full overflow-hidden rounded-md border border-gray-200/80 bg-white"
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        if (width > 0 && width !== measuredWidth) {
          setMeasuredWidth(width);
        }
      }}
      style={{
        width: cardWidth,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }}
    >
      <PropertyCardImageCarousel
        images={displayImages}
        imageWidth={imageWidth}
        isFeatured={isFeatured}
        isFavorited={isFavorited}
        onPress={handlePress}
        onFavorite={onFavorite}
        onShare={onShare}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        testID={`property-card-${id}`}
        className="px-4 py-3"
      >
        <PropertyCardPriceRow price={price} timeAgo={timeAgo} />
        <PropertyCardInfoRow
          categoryLabel={categoryLabel || category || type || 'عقار'}
          location={location}
          area={area}
        />
        <PropertyCardIncomeRow propertyIncome={propertyIncome} />
      </TouchableOpacity>
    </View>
  );
}
