import { act, renderHook } from '@testing-library/react-native';

import { plansService, PublishOption } from '@/shared/api/plans.service';
import { propertiesService } from '@/shared/api/properties.service';
import { imageLimitFor } from '@/shared/hooks/properties/useAdImageLimit';
import { useSubmitListing } from '@/shared/hooks/properties/useSubmitListing';
import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

// QA: a valid bought package was rejected as "invalid or empty". These cover
// the app side of the fix: one publish per tap, the same key on every retry,
// and a way forward when the server refuses the package.

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: { getPublishOptions: jest.fn() },
}));

jest.mock('@/shared/api/properties.service', () => ({
  propertiesService: {
    uploadImages: jest.fn(),
    createProperty: jest.fn(),
    getFeaturesMetadata: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockGetOptions = plansService.getPublishOptions as jest.Mock;
const mockCreate = propertiesService.createProperty as jest.Mock;
const mockAlert = showAlert as jest.Mock;

const option = (slotId: string): PublishOption => ({
  type: 'PLAN_SLOT',
  slotId,
  title: `باقة ${slotId}`,
  subtitle: '',
  planName: slotId,
  color: '#15304D',
  adsRemaining: 3,
  durationDays: 30,
  maxImagesPerAd: 10,
  featuredDays: 0,
  prioritySearch: false,
});

const packageRefused = (message: string) => ({
  response: {
    status: 403,
    data: { statusCode: 403, message, code: 'PACKAGE_UNUSABLE' },
  },
});

const sentKeys = () =>
  mockCreate.mock.calls.map(
    ([payload]: [{ submissionKey?: string }]) => payload.submissionKey,
  );

async function setup() {
  const utils = await renderHook(() => useSubmitListing());
  const picker = { present: jest.fn(), dismiss: jest.fn() };
  const quotaSheet = { present: jest.fn(), dismiss: jest.fn() };
  (utils.result.current.slotPickerRef as { current: unknown }).current = picker;
  (utils.result.current.quotaSheetRef as { current: unknown }).current =
    quotaSheet;
  return { ...utils, picker, quotaSheet };
}

describe('useSubmitListing publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useListingStore.getState().resetForm();
    useListingStore.setState({ adLevel: 'normal', images: [] });
    mockGetOptions.mockResolvedValue({
      canPublish: true,
      options: [option('slot-a')],
    });
    mockCreate.mockResolvedValue({ property: { id: 'prop-1' } });
  });

  it('publishes once from the only package, sending a submission key', async () => {
    const { result } = await setup();

    await act(() => result.current.handleSubmit());

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0]).toMatchObject({
      isDraft: false,
      planSlotId: 'slot-a',
    });
    expect(sentKeys()[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(result.current.showSuccess).toBe(true);
    // A finished publish frees the key for the next ad
    expect(useListingStore.getState().submissionKey).toBeNull();
  });

  it('sends one publish for a double tap', async () => {
    const { result } = await setup();

    await act(async () => {
      await Promise.all([
        result.current.handleSubmit(),
        result.current.handleSubmit(),
      ]);
    });

    expect(mockGetOptions).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('reuses the same key when the user retries after a lost response', async () => {
    mockCreate
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ property: { id: 'prop-1' } });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());
    expect(mockAlert).toHaveBeenCalledWith('خطأ', 'Network Error');

    await act(() => result.current.handleSubmit());

    const [first, second] = sentKeys();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  it('never sends a key with a draft', async () => {
    const { result } = await setup();

    await act(() => result.current.handleSaveDraft());

    expect(mockCreate.mock.calls[0][0]).toMatchObject({ isDraft: true });
    expect(sentKeys()[0]).toBeUndefined();
  });

  it('offers the packages still available when the server refuses the picked one', async () => {
    mockGetOptions
      .mockResolvedValueOnce({
        canPublish: true,
        options: [option('slot-a'), option('slot-b')],
      })
      .mockResolvedValueOnce({ canPublish: true, options: [option('slot-b')] });
    mockCreate.mockRejectedValueOnce(packageRefused('نفدت إعلانات هذه الباقة.'));
    const { result, picker } = await setup();

    await act(() => result.current.handleSubmit());
    await act(() => result.current.handleSlotSelected('slot-a'));

    expect(mockAlert).toHaveBeenCalledWith(
      'تعذر النشر من هذه الباقة',
      'نفدت إعلانات هذه الباقة.',
      [expect.objectContaining({ text: 'اختيار باقة أخرى' })],
    );
    picker.present.mockClear();
    const [, , [choose]] = mockAlert.mock.calls[0];
    await act(async () => choose.onPress());

    expect(result.current.publishOptions.map((o) => o.slotId)).toEqual([
      'slot-b',
    ]);
    expect(picker.present).toHaveBeenCalled();
  });

  it('shows the out-of-balance sheet when nothing is left after a refusal', async () => {
    mockGetOptions
      .mockResolvedValueOnce({ canPublish: true, options: [option('slot-a')] })
      .mockResolvedValueOnce({ canPublish: false, options: [] });
    mockCreate.mockRejectedValueOnce(packageRefused('نفدت إعلانات هذه الباقة.'));
    const { result, quotaSheet } = await setup();

    await act(() => result.current.handleSubmit());

    expect(quotaSheet.present).toHaveBeenCalled();
    expect(result.current.quotaSheetMode).toBe('exhausted');
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('keeps a plain error for other refusals (e.g. company under review)', async () => {
    mockCreate.mockRejectedValueOnce({
      response: { status: 403, data: { message: 'الحساب قيد المراجعة' } },
    });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());

    expect(mockGetOptions).toHaveBeenCalledTimes(1);
    expect(mockAlert).toHaveBeenCalledWith('خطأ', 'الحساب قيد المراجعة');
  });
});

// Ministry of Commerce, December 2024: a clear, fixed price, and an owner
// who says so -- told before anything is checked or spent
describe('useSubmitListing clear price and owner', () => {
  const { useAuthStore } = jest.requireActual('@/shared/store/useAuthStore');

  beforeEach(() => {
    jest.clearAllMocks();
    useListingStore.getState().resetForm();
    useListingStore.setState({ adLevel: 'normal', images: [] });
    mockGetOptions.mockResolvedValue({ canPublish: true, options: [option('slot-a')] });
    mockCreate.mockResolvedValue({ property: { id: 'prop-1' } });
  });
  afterEach(() => useAuthStore.setState({ activeIdentity: null }));

  it('refuses a description that qualifies the price, before checking packages', async () => {
    useListingStore.setState({ adDetails: 'شقة للإيجار، السعر على السوم' });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());

    expect(mockAlert).toHaveBeenCalledWith(
      'السعر غير واضح',
      expect.stringContaining('وزارة التجارة'),
    );
    expect(mockGetOptions).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('asks an individual to declare they own the property', async () => {
    useAuthStore.setState({ activeIdentity: { id: 'i1', type: 'INDIVIDUAL' } });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());
    expect(mockAlert).toHaveBeenCalledWith('أكّد ملكية العقار', expect.any(String));
    expect(mockCreate).not.toHaveBeenCalled();

    useListingStore.setState({ isOwner: true });
    await act(() => result.current.handleSubmit());
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0]).toMatchObject({ isOwner: true });
  });

  it('does not ask an office for the owner declaration', async () => {
    useAuthStore.setState({ activeIdentity: { id: 'o1', type: 'OFFICE' } });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

// QA: every ad allowed 10 photos; عادي allows 5 and مميز 15
describe('photo limit by ad type', () => {
  const free: PublishOption = {
    ...option('FREE_QUOTA'),
    type: 'FREE_QUOTA',
    maxImagesPerAd: 5,
    featuredDays: 0,
  };
  const golden: PublishOption = {
    ...option('slot-gold'),
    maxImagesPerAd: 15,
    featuredDays: 7,
  };
  const photos = (n: number) => Array.from({ length: n }, (_, i) => `img-${i}`);

  beforeEach(() => {
    jest.clearAllMocks();
    useListingStore.getState().resetForm();
    (propertiesService.uploadImages as jest.Mock).mockResolvedValue(['u']);
    mockCreate.mockResolvedValue({ property: { id: 'prop-1' } });
    mockGetOptions.mockResolvedValue({ canPublish: true, options: [free, golden] });
  });

  it('gives عادي 5 and مميز 15 from the packages, with those as defaults', () => {
    expect(imageLimitFor('normal', [free, golden])).toBe(5);
    expect(imageLimitFor('premium', [free, golden])).toBe(15);
    expect(imageLimitFor('normal', undefined)).toBe(5);
    expect(imageLimitFor('premium', [])).toBe(15);
  });

  it('asks to remove photos before publishing a normal ad with 6', async () => {
    useListingStore.setState({ adLevel: 'normal', images: photos(6) });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());

    expect(mockAlert).toHaveBeenCalledWith(
      'عدد الصور أكثر من المسموح',
      expect.stringContaining('5'),
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('publishes a featured ad with 15 photos', async () => {
    mockGetOptions.mockResolvedValue({ canPublish: true, options: [golden] });
    useListingStore.setState({ adLevel: 'premium', images: photos(15) });
    const { result } = await setup();

    await act(() => result.current.handleSubmit());

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
