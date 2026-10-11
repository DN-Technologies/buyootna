import { act, cleanup, render } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { showAlert } from '@/shared/utils/alert';

import { useRequestQuoteForm } from '../useRequestQuoteForm';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: {
    create: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const hookRef = { current: null as unknown as ReturnType<typeof useRequestQuoteForm> };

function FormHarness() {
  const hook = useRequestQuoteForm();
  hookRef.current = hook;
  return null;
}

describe('useRequestQuoteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const setup = async () => {
    return await render(<FormHarness />);
  };

  it('validates required specialty before submitting', async () => {
    await setup();

    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'يرجى اختيار مجال التخصص');
    expect(companyRequestsService.create).not.toHaveBeenCalled();
  });

  it('validates required address before submitting', async () => {
    await setup();

    await act(async () => {
      hookRef.current.setSpecialtyId('مقاولين');
    });

    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'يرجى تحديد العنوان على الخريطة');
    expect(companyRequestsService.create).not.toHaveBeenCalled();
  });

  it('asks for a description before sending (the API requires one)', async () => {
    await setup();

    await act(async () => {
      hookRef.current.setSpecialtyId('مقاولين');
      hookRef.current.handleConfirmAddress('حولي', 29.33, 48.02);
    });
    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'يرجى كتابة وصف الطلب');
    expect(companyRequestsService.create).not.toHaveBeenCalled();
  });

  it('successfully submits valid quote request and triggers onSuccess callback', async () => {
    (companyRequestsService.create as jest.Mock).mockResolvedValueOnce({ id: 'req-1' });
    const onSuccess = jest.fn();
    await setup();

    await act(async () => {
      hookRef.current.setSpecialtyId('مقاولين');
      hookRef.current.setRequestTypeId('quote');
      hookRef.current.setPriceFrom('200');
      hookRef.current.setPriceTo('800');
      hookRef.current.handleConfirmAddress('مدينة الكويت', 29.3759, 47.9774);
      hookRef.current.setDescription('تفاصيل التشطيب');
      hookRef.current.setAttachments(['file:///img1.jpg']);
    });

    await act(async () => {
      await hookRef.current.handleSubmit(onSuccess);
    });

    expect(companyRequestsService.create).toHaveBeenCalledWith({
      title: 'مقاولين',
      category: 'مقاولين',
      offerType: 'عرض سعر',
      priceRange: '200 - 800 د.ك',
      location: 'مدينة الكويت',
      latitude: 29.3759,
      longitude: 47.9774,
      description: 'تفاصيل التشطيب',
      images: ['file:///img1.jpg'],
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(hookRef.current.isSubmitting).toBe(false);
  });

  it('displays alert on submission error', async () => {
    (companyRequestsService.create as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'فشل في حفظ الطلب' } },
    });
    await setup();

    await act(async () => {
      hookRef.current.setSpecialtyId('مقاولين');
      hookRef.current.handleConfirmAddress('حولي', 29.33, 48.02);
      hookRef.current.setDescription('تفاصيل');
    });

    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(showAlert).toHaveBeenCalledWith('خطأ', 'فشل في حفظ الطلب');
    expect(hookRef.current.isSubmitting).toBe(false);
  });

  it('handles image picking when permission is granted', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg' }],
    });

    await setup();

    await act(async () => {
      await hookRef.current.handlePickAttachments();
    });

    expect(hookRef.current.attachments).toContain('file:///photo.jpg');
  });

  it('alerts when media library permission is not granted', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    await setup();

    await act(async () => {
      await hookRef.current.handlePickAttachments();
    });

    expect(showAlert).toHaveBeenCalledWith(
      'إذن مطلوب',
      'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!',
      [{ text: 'حسناً' }],
    );
    expect(hookRef.current.attachments).toHaveLength(0);
  });

  it('removes attachment by index', async () => {
    await setup();

    await act(async () => {
      hookRef.current.setAttachments(['file:///a.jpg', 'file:///b.jpg']);
    });

    await act(async () => {
      hookRef.current.removeAttachment(0);
    });

    expect(hookRef.current.attachments).toEqual(['file:///b.jpg']);
  });
});
