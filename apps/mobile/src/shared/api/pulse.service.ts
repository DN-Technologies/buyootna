import apiClient from '@/shared/api/api';

export type PulseKind =
  | 'requestOffers'
  | 'adExpiring'
  | 'alertMatches'
  | 'providerStory';

export type PulseTone = 'gold' | 'amber' | 'red';

// One thing going on for the active profile (GET /pulse/me), as facts; the
// words are the app's (pulseItems.ts)
export interface PulseItem {
  kind: PulseKind;
  count: number;
  // Where a tap goes when the items share one target; null when several
  refId: string | null;
  daysLeft?: number;
  avatarUrl?: string | null;
  tone: PulseTone;
}

export const pulseService = {
  getMine: async (): Promise<PulseItem[]> => {
    const response = await apiClient.get<{ items: PulseItem[] }>('/pulse/me');
    return response.data.items;
  },
};
