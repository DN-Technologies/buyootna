import apiClient from '@/shared/api/api';

export interface BlockedAccount {
  userId: string;
  name: string;
  avatarUrl: string | null;
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE' | null;
  blockedAt: string;
}

/** Who to block: the account, or one of its profiles (enough on its own). */
export interface BlockTarget {
  userId?: string;
  identityId?: string;
}

export const blocksService = {
  /** Blocks an account: no chat either way; its content is hidden from you. */
  block: async (target: BlockTarget): Promise<{ blocked: boolean }> => {
    const response = await apiClient.post<{ blocked: boolean }>('/blocks', target);
    return response.data;
  },

  unblock: async (userId: string): Promise<{ blocked: boolean }> => {
    const response = await apiClient.delete<{ blocked: boolean }>(`/blocks/${userId}`);
    return response.data;
  },

  /** The accounts you blocked, newest first. */
  list: async (): Promise<BlockedAccount[]> => {
    const response = await apiClient.get<BlockedAccount[]>('/blocks');
    return response.data;
  },

  /** Whether you blocked this account. */
  status: async (userId: string): Promise<{ blocked: boolean }> => {
    const response = await apiClient.get<{ blocked: boolean }>(`/blocks/${userId}`);
    return response.data;
  },
};
