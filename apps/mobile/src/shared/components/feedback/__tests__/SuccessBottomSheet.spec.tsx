import { render } from '@testing-library/react-native';

import SuccessBottomSheet from '../SuccessBottomSheet';

// What the sheet passes to the bottom sheet and its backdrop
const mockSheetProps: Record<string, any>[] = [];
const mockBackdropProps: Record<string, any>[] = [];
jest.mock('@gorhom/bottom-sheet', () => {
  const { forwardRef } = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    BottomSheetModal: forwardRef((props: any, _ref: unknown) => {
      mockSheetProps.push(props);
      const Backdrop = props.backdropComponent;
      return (
        <View>
          {Backdrop ? <Backdrop /> : null}
          {props.children}
        </View>
      );
    }),
    BottomSheetBackdrop: (props: any) => {
      mockBackdropProps.push(props);
      return null;
    },
    BottomSheetView: ({ children }: any) => <View>{children}</View>,
  };
});

const renderSheet = (extra: object) =>
  render(
    <SuccessBottomSheet
      title="تم إنشاء حساب شركتك بنجاح"
      description="..."
      buttonText="العودة الى الرئيسية"
      onPress={jest.fn()}
      {...extra}
    />,
  );

describe('SuccessBottomSheet', () => {
  beforeEach(() => {
    mockSheetProps.length = 0;
    mockBackdropProps.length = 0;
  });

  it('closes by a tap outside or a swipe by default', async () => {
    await renderSheet({});
    expect(mockSheetProps.at(-1)?.enablePanDownToClose).toBe(true);
    expect(mockBackdropProps.at(-1)?.pressBehavior).toBe('close');
  });

  // QA: a tap outside closed the sign-up's sheet and left the user stuck
  it('not dismissible: only its button closes it, and any close is reported', async () => {
    const onDismiss = jest.fn();
    await renderSheet({ dismissible: false, onDismiss });
    expect(mockSheetProps.at(-1)?.enablePanDownToClose).toBe(false);
    expect(mockBackdropProps.at(-1)?.pressBehavior).toBe('none');
    expect(mockSheetProps.at(-1)?.onDismiss).toBe(onDismiss);
  });
});
