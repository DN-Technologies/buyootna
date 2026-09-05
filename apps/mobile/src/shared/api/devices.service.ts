import apiClient from '@/shared/api/api';

export interface DeviceItem {
  id: string;
  deviceName: string;
  platform: 'ios' | 'android' | null;
  isActive: boolean;
  lastActive: string;
  location: string | null;
}

export const devicesService = {
  getDevices: async (): Promise<DeviceItem[]> => {
    const response = await apiClient.get<DeviceItem[]>('/devices');
    return response.data;
  },

  revokeDevice: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/devices/${id}`);
    return response.data;
  },

  revokeAllDevices: async (): Promise<any> => {
    const response = await apiClient.delete('/devices');
    return response.data;
  },
};
