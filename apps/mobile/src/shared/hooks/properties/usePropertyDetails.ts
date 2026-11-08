import { useQuery } from '@tanstack/react-query';

import { propertiesService } from '@/shared/api/properties.service';
import { PropertyDetailsDto } from '@/types/property';

export function usePropertyDetails(id?: string) {
  const {
    data: property,
    isLoading,
    isError,
    error,
    isFetching,
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
    error,
    // A retry after an error (the error state stays up meanwhile)
    isRetrying: isError && isFetching,
    refetch,
  };
}
