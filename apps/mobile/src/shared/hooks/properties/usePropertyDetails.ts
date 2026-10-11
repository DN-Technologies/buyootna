import { useQuery } from '@tanstack/react-query';

import { propertiesService } from '@/shared/api/properties.service';
import { PropertyDetailsDto } from '@/types/property';

export function usePropertyDetails(id?: string) {
  const {
    data: property,
    isLoading,
    isError,
    refetch,
  } = useQuery<PropertyDetailsDto>({
    queryKey: ['property', id],
    queryFn: () => propertiesService.getPropertyDetails(String(id)),
    enabled: Boolean(id),
  });

  return {
    property,
    isLoading,
    isError,
    refetch,
  };
}
