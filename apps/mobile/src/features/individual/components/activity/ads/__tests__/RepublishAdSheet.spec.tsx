import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import RepublishAdSheet from '../RepublishAdSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const actual = jest.requireActual('@gorhom/bottom-sheet');

  const MockModal = React.forwardRef(function BottomSheetModal(
    { children }: { children?: React.ReactNode },
    ref: any,
  ) {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
      close: jest.fn(),
    }));
    return <>{children}</>;
  });

  function MockView({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  }

  function MockBackdrop() {
    return null;
  }

  return {
    ...actual,
    BottomSheetModal: MockModal,
    BottomSheetView: MockView,
    BottomSheetBackdrop: MockBackdrop,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('RepublishAdSheet', () => {
  it('renders simple mode correctly', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByText, getByTestId } = await render(
      <RepublishAdSheet
        ref={ref}
        mode="simple"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(getByText('إعادة نشر الإعلان؟')).toBeTruthy();
    expect(
      getByText(
        'سيتم خصم إعلان واحد من رصيدك، وسيتم نشر الإعلان لمدة 30 يومًا.',
      ),
    ).toBeTruthy();
    expect(getByText('إعادة النشر')).toBeTruthy();
    expect(getByText('تراجع')).toBeTruthy();

    await fireEvent.press(getByTestId('republish-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledWith('REGULAR');
  });

  it('renders multi-choice mode and switches plan type', async () => {
    const onConfirm = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByText, getByTestId } = await render(
      <RepublishAdSheet
        ref={ref}
        mode="multi"
        freeAdsRemaining={1}
        subscription={{ goldRemaining: 2, silverRemaining: 0, normalRemaining: 1 }}
        onConfirm={onConfirm}
      />,
    );

    expect(getByText('إعلان مميز')).toBeTruthy();
    expect(getByText('إعلان عادي')).toBeTruthy();
    expect(getByText('رصيدك: 2 إعلان')).toBeTruthy();
    expect(getByText('رصيدك: 2 إعلانات')).toBeTruthy();

    // Default is featured
    await fireEvent.press(getByTestId('republish-option-regular'));
    await fireEvent.press(getByTestId('republish-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledWith('REGULAR');
  });

  it('renders zero-credit mode and handles plans navigation', async () => {
    const onNavigateToPlans = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByText, getByTestId } = await render(
      <RepublishAdSheet
        ref={ref}
        mode="zero-credit"
        onConfirm={jest.fn()}
        onNavigateToPlans={onNavigateToPlans}
      />,
    );

    expect(getByText(/لا يوجد لديك رصيد إعلانات حاليًا/)).toBeTruthy();
    expect(getByText('استعراض الباقات')).toBeTruthy();

    await fireEvent.press(getByTestId('republish-confirm-btn'));
    expect(onNavigateToPlans).toHaveBeenCalledTimes(1);
  });

  it('auto-resolves to zero-credit when total quota is 0', async () => {
    const ref = createRef<BottomSheetModal>();

    const { getByText } = await render(
      <RepublishAdSheet
        ref={ref}
        freeAdsRemaining={0}
        onConfirm={jest.fn()}
      />,
    );

    expect(getByText(/لا يوجد لديك رصيد إعلانات حاليًا/)).toBeTruthy();
    expect(getByText('استعراض الباقات')).toBeTruthy();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByTestId } = await render(
      <RepublishAdSheet
        ref={ref}
        mode="simple"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    await fireEvent.press(getByTestId('republish-cancel-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('offers both kinds from the real wallet and spends the picked slot', async () => {
    const onConfirm = jest.fn();
    const ref = createRef<BottomSheetModal>();
    const base = {
      title: '',
      subtitle: '',
      planName: '',
      color: '#15304D',
      durationDays: 30,
      maxImagesPerAd: 10,
      prioritySearch: false,
    };

    const { getByText, getByTestId } = await render(
      <RepublishAdSheet
        ref={ref}
        publishOptions={[
          { ...base, type: 'FREE_QUOTA', slotId: 'FREE_QUOTA', adsRemaining: 1, featuredDays: 0 },
          { ...base, type: 'PLAN_SLOT', slotId: 'slot-gold', adsRemaining: 1, featuredDays: 7 },
          { ...base, type: 'PLAN_SLOT', slotId: 'slot-normal', adsRemaining: 2, featuredDays: 0 },
        ]}
        onConfirm={onConfirm}
      />,
    );

    expect(getByText('رصيدك: 1 إعلان')).toBeTruthy();
    expect(getByText('رصيدك: 3 إعلانات')).toBeTruthy();

    // Featured is preselected
    await fireEvent.press(getByTestId('republish-confirm-btn'));
    expect(onConfirm).toHaveBeenLastCalledWith('FEATURED', 'slot-gold');

    await fireEvent.press(getByTestId('republish-option-regular'));
    await fireEvent.press(getByTestId('republish-confirm-btn'));
    expect(onConfirm).toHaveBeenLastCalledWith('REGULAR', 'FREE_QUOTA');
  });

  it('states how long the ad will stay up with the credit being spent', async () => {
    const ref = createRef<BottomSheetModal>();
    const base = {
      title: '',
      subtitle: '',
      planName: '',
      color: '#15304D',
      maxImagesPerAd: 10,
      prioritySearch: false,
    };

    const { getByText, getByTestId } = await render(
      <RepublishAdSheet
        ref={ref}
        publishOptions={[
          { ...base, type: 'FREE_QUOTA', slotId: 'FREE_QUOTA', adsRemaining: 1, featuredDays: 0, durationDays: 10 },
          { ...base, type: 'PLAN_SLOT', slotId: 'slot-gold', adsRemaining: 1, featuredDays: 7, durationDays: 30 },
        ]}
        onConfirm={jest.fn()}
      />,
    );

    // Featured is preselected: the gold plan's 30 days
    expect(getByText(/لمدة 30 يومًا/)).toBeTruthy();
    // The free ad only lasts 10
    await fireEvent.press(getByTestId('republish-option-regular'));
    expect(getByText(/لمدة 10 يومًا/)).toBeTruthy();
  });
});
