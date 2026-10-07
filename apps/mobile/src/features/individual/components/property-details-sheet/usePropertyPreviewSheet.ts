import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { propertiesService } from '@/shared/api/properties.service';
import { PropertyDto } from '@/types/feed';
import { PropertyDetailsDto } from '@/types/property';

// Same key as usePropertyDetails, so a sheet fetch also warms the full page
const detailsKey = (id: string) => ['property', id];
const DETAILS_STALE_MS = 60_000;

/**
 * Builds what the details sheet can show straight from a feed card, so the
 * sheet opens with content instead of a spinner. Fields the feed doesn't
 * carry (description, views, address details, licence) fill in once the
 * full details arrive.
 */
export function feedItemToDetailsPreview(
  item: PropertyDto,
  listingType?: PropertyDetailsDto['type'],
): PropertyDetailsDto {
  return {
    id: item.id,
    type: listingType ?? ('' as PropertyDetailsDto['type']),
    // The feed sends the Arabic category label, which the sheet's title
    // helper passes through unchanged
    category: item.categoryLabel ?? '',
    isFeatured: item.isFeatured,
    price: item.price,
    area: item.area,
    areaSize: item.area,
    beds: item.beds,
    baths: item.baths,
    location: item.location,
    description: '',
    views: 0,
    images: item.images,
    createdAt: item.createdAt,
    publishedAt: item.publishedAt,
    phoneNumber: item.phoneNumber,
    phone: item.phone,
    propertyIncome: item.propertyIncome,
    host: {
      id: item.identityId ?? '',
      name: item.companyName,
      avatarUrl: '',
      joinedDate: '',
      isVerified: false,
      rating: 0,
      role: item.identityType,
    },
  };
}

/**
 * Details bottom sheet state for feed lists: opens instantly with the card's
 * data (or cached full details) and swaps in the full details when fetched.
 */
export function usePropertyPreviewSheet(
  listingType?: PropertyDetailsDto['type'],
) {
  const queryClient = useQueryClient();
  const sheetRef = useRef<BottomSheetModal>(null);
  const openIdRef = useRef<string | null>(null);
  const [property, setProperty] = useState<PropertyDetailsDto | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const openDetails = async (item: PropertyDto) => {
    openIdRef.current = item.id;
    const cached = queryClient.getQueryData<PropertyDetailsDto>(
      detailsKey(item.id),
    );
    setProperty(cached ?? feedItemToDetailsPreview(item, listingType));
    setIsLoadingDetails(!cached);
    sheetRef.current?.present();

    try {
      const full = await queryClient.fetchQuery({
        queryKey: detailsKey(item.id),
        queryFn: () => propertiesService.getPropertyById(item.id),
        staleTime: DETAILS_STALE_MS,
      });
      // Ignore a late response for a card the user has since moved on from
      if (openIdRef.current === item.id) setProperty(full);
    } catch (error) {
      console.error('Failed to fetch property details:', error);
      // Without cached details the preview is all we have; keep it open
      // rather than yanking the sheet away
    } finally {
      if (openIdRef.current === item.id) setIsLoadingDetails(false);
    }
  };

  return { sheetRef, property, isLoadingDetails, openDetails };
}
