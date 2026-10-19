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
      hookRef.current.setSpecialtyId('التشطيب');
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
      hookRef.current.setSpecialtyId('التشطيب');
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
      hookRef.current.setSpecialtyId('التشطيب');
      hookRef.current.setRequestTypeId('تشطيب شقة');
      hookRef.current.setPriceFrom('200');
      hookRef.current.setPriceTo('800');
      hookRef.current.handleConfirmAddress('مدينة الكويت', 29.3759, 47.9774);
      hookRef.current.setDescription('تفاصيل التشطيب');
      hookRef.current.setAttachments(['file:///img1.jpg']);
    });

    await act(async () => {
      await hookRef.current.handleSubmit(onSuccess);
    });

    // The request type names it; the specialty decides which companies see it
    expect(companyRequestsService.create).toHaveBeenCalledWith({
      title: 'تشطيب شقة',
      category: 'التشطيب',
      addressDetails: undefined,
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

  it("offers the picked specialty's request types, and a new specialty clears the pick", async () => {
    await setup();
    expect(hookRef.current.requestTypeOptions).toEqual([]);

    await act(async () => {
      hookRef.current.setSpecialtyId('المسابح');
    });
    expect(hookRef.current.requestTypeOptions.map((o: { id: string }) => o.id)).toEqual([
      'تصميم وإنشاء مسبح',
      'معالجة تسربات المسبح',
      'صيانة المضخات والفلاتر',
      'تنظيف المسبح',
      'معالجة المياه والكيماويات',
      'اخرى',
    ]);

    await act(async () => {
      hookRef.current.setRequestTypeId('تنظيف المسبح');
    });
    await act(async () => {
      hookRef.current.setSpecialtyId('التكييف');
    });
    expect(hookRef.current.requestTypeId).toBe('');
  });

  it('without a request type, the specialty names the request', async () => {
    (companyRequestsService.create as jest.Mock).mockResolvedValueOnce({ id: 'r2' });
    await setup();
    await act(async () => {
      hookRef.current.setSpecialtyId('التكييف');
      hookRef.current.handleConfirmAddress('مدينة الكويت', 29.3759, 47.9774);
      hookRef.current.setDescription('مكيف لا يبرد');
    });
    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(companyRequestsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'التكييف', category: 'التكييف' }),
    );
  });

  const fill = async () => {
    await act(async () => {
      hookRef.current.setSpecialtyId('التشطيب');
      hookRef.current.setRequestTypeId('تشطيب شقة');
      hookRef.current.setPriceFrom('200');
      hookRef.current.setPriceTo('800');
      hookRef.current.handleConfirmAddress('مدينة الكويت', 29.3759, 47.9774);
      hookRef.current.setDescription('تفاصيل التشطيب');
      hookRef.current.setAttachments(['file:///img1.jpg']);
    });
  };

  it('empties the form after the request is sent, so it cannot be sent twice', async () => {
    (companyRequestsService.create as jest.Mock).mockResolvedValue({ id: 'r1' });
    await setup();
    await fill();

    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(hookRef.current.specialtyId).toBe('');
    expect(hookRef.current.requestTypeId).toBe('');
    expect(hookRef.current.priceFrom).toBe('');
    expect(hookRef.current.priceTo).toBe('');
    expect(hookRef.current.addressLabel).toBe('');
    expect(hookRef.current.addressCoords).toBeNull();
    expect(hookRef.current.description).toBe('');
    expect(hookRef.current.attachments).toEqual([]);

    // A second tap with nothing filled in is refused
    await act(async () => {
      await hookRef.current.handleSubmit();
    });
    expect(companyRequestsService.create).toHaveBeenCalledTimes(1);
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'يرجى اختيار مجال التخصص');
  });

  it('keeps what was entered when sending fails', async () => {
    (companyRequestsService.create as jest.Mock).mockRejectedValueOnce(new Error('x'));
    await setup();
    await fill();

    await act(async () => {
      await hookRef.current.handleSubmit();
    });

    expect(hookRef.current.specialtyId).toBe('التشطيب');
    expect(hookRef.current.description).toBe('تفاصيل التشطيب');
    expect(hookRef.current.attachments).toEqual(['file:///img1.jpg']);
  });

  it('sends once when the button is tapped twice quickly', async () => {
    let resolveCreate: (v: unknown) => void = () => undefined;
    (companyRequestsService.create as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    await setup();
    await fill();

    await act(async () => {
      const first = hookRef.current.handleSubmit();
      const second = hookRef.current.handleSubmit();
      resolveCreate({ id: 'r1' });
      await Promise.all([first, second]);
    });

    expect(companyRequestsService.create).toHaveBeenCalledTimes(1);
  });

  it('displays alert on submission error', async () => {
    (companyRequestsService.create as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'فشل في حفظ الطلب' } },
    });
    await setup();

    await act(async () => {
      hookRef.current.setSpecialtyId('التشطيب');
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
