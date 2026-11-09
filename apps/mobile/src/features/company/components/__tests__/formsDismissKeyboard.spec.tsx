// QA: pressing a company form's button with the keyboard up left it there,
// and the success sheet (or an error) opened underneath it. Each form now
// closes the keyboard first, before anything is sent.
import { act, renderHook } from '@testing-library/react-native';
import { Keyboard, Share } from 'react-native';

import { companyService } from '@/shared/api/company.service';
import { propertiesService } from '@/shared/api/properties.service';
import { useAlertStore } from '@/shared/store/useAlertStore';

import { useAddProject } from '../add-project/useAddProject';
import { useAddService } from '../add-service/useAddService';
import { useCreateInvoice } from '../create-invoice/useCreateInvoice';

const mockEvents: string[] = [];

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    displayName: 'شركة',
    avatarUrl: null,
    activeIdentity: { companyData: { specialty: 'مكتب هندسي' } },
  }),
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: object) => unknown) =>
    selector({ refreshProfile: jest.fn() }),
}));
jest.mock('@/features/company/hooks/useMyCompanyServices', () => ({
  useMyCompanyServices: () => ({ services: [], specialty: null, isLoading: false }),
}));
jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    createService: jest.fn(),
    createProject: jest.fn(),
    createInvoice: jest.fn(),
  },
}));
jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: { uploadImages: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }),
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({ canceled: false, assets: [{ uri: 'file:///a.jpg' }] }),
  ),
}));

const recordCall = (label: string) => () => {
  mockEvents.push(label);
  return Promise.resolve({ invoice: { invoiceNo: 'INV-1' } });
};
const failCall = (label: string) => () => {
  mockEvents.push(label);
  return Promise.reject(new Error('down'));
};
const sheet = () => ({
  present: jest.fn(() => mockEvents.push('sheet')),
  dismiss: jest.fn(),
});

describe('company forms close the keyboard when their button is pressed', () => {
  beforeEach(() => {
    mockEvents.length = 0;
    jest
      .spyOn(Keyboard, 'dismiss')
      .mockImplementation(() => void mockEvents.push('keyboard'));
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'dismissedAction' });
    jest
      .spyOn(useAlertStore.getState(), 'showAlert')
      .mockImplementation(() => void mockEvents.push('alert'));
    (propertiesService.uploadImages as jest.Mock).mockResolvedValue(['u']);
  });
  afterEach(() => jest.restoreAllMocks());

  it('اصدار فاتورة: before sending, so the success sheet is in view', async () => {
    (companyService.createInvoice as jest.Mock).mockImplementation(
      recordCall('send'),
    );
    const { result } = await renderHook(() => useCreateInvoice());
    (result.current.successSheetRef as { current: unknown }).current = sheet();
    await act(async () => result.current.setClientName('أحمد'));
    await act(async () => result.current.setTitle('صيانة'));
    await act(async () => result.current.primaryAction());
    await act(async () => result.current.primaryAction());
    await act(async () => result.current.primaryAction());

    expect(mockEvents).toEqual(['keyboard', 'send', 'sheet']);
  });

  it('إضافة مشروع: before uploading, so the success sheet is in view', async () => {
    (companyService.createProject as jest.Mock).mockImplementation(
      recordCall('send'),
    );
    const { result } = await renderHook(() => useAddProject());
    (result.current.successSheetRef as { current: unknown }).current = sheet();
    await act(async () => result.current.setProjectTitle('فيلا'));
    await act(async () => result.current.setDescription('تشطيب كامل'));
    await act(async () => result.current.pickImages());
    expect(result.current.isValid).toBe(true);
    await act(async () => result.current.submit());

    expect(mockEvents).toEqual(['keyboard', 'send', 'sheet']);
  });

  it('إضافة خدمة: before sending, so an error is in view too', async () => {
    (companyService.createService as jest.Mock).mockImplementation(
      failCall('send'),
    );
    const { result } = await renderHook(() => useAddService());
    await act(async () => result.current.selectSpecialty('مكتب هندسي'));
    await act(async () => result.current.toggleType('مخططات تنفيذية'));
    expect(result.current.isValid).toBe(true);
    await act(async () => result.current.submit());

    expect(mockEvents).toEqual(['keyboard', 'send', 'alert']);
  });
});
