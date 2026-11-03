import apiClient from '@/shared/api/api';

export type BulkAction = 'hide' | 'show' | 'delete';

// POST /properties/me/bulk takes this many ids at once
const BULK_LIMIT = 100;

export const officePropertiesService = {
  /** Hides, shows or deletes many of the office's own ads. */
  bulk: async (action: BulkAction, ids: string[]): Promise<number> => {
    let count = 0;
    for (let i = 0; i < ids.length; i += BULK_LIMIT) {
      const response = await apiClient.post<{ count: number }>(
        '/properties/me/bulk',
        { action, ids: ids.slice(i, i + BULK_LIMIT) },
      );
      count += response.data.count;
    }
    return count;
  },

  /** «تم البيع»: the ad leaves the market for المؤرشفة. */
  markDone: async (propertyId: string): Promise<void> => {
    await apiClient.post(`/properties/${propertyId}/close`);
  },
};
