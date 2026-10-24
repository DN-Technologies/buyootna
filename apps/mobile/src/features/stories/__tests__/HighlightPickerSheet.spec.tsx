import { act, fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import HighlightPickerSheet from '../studio/HighlightPickerSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  const { View, ScrollView } = jest.requireActual('react-native');
  return {
    BottomSheetModal: forwardRef(
      (
        { children, onDismiss }: { children: unknown; onDismiss: () => void },
        ref: unknown,
      ) => {
        useImperativeHandle(ref, () => ({ dismiss: onDismiss, present: jest.fn() }));
        return <View>{children as never}</View>;
      },
    ),
    BottomSheetScrollView: ScrollView,
    BottomSheetBackdrop: () => null,
  };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-image', () => ({ Image: 'Image' }));
const mockMutate = jest.fn();
jest.mock('../hooks/useStoryHighlights', () => ({
  useMyHighlights: () => ({
    data: {
      highlights: [
        { id: 'h1', title: 'مشاريعنا', coverUrl: null, stories: [{ id: 'a' }] },
        { id: 'h2', title: 'عروض', coverUrl: null, stories: [{ id: 'a' }, { id: 'b' }] },
      ],
    },
  }),
  useHighlightMutations: () => ({ update: { mutate: mockMutate } }),
}));

describe('HighlightPickerSheet (the studio archive)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('adds the picked stories it lacks at the end, then ends the selection', async () => {
    const onDone = jest.fn();
    mockMutate.mockImplementation((_v, { onSuccess }) => onSuccess());
    const screen = await render(
      <HighlightPickerSheet ref={createRef()} storyIds={['a', 'b']} onDone={onDone} />,
    );
    expect(screen.getByText('إضافة إلى المميزة (2)')).toBeTruthy();
    // «عروض» has both already
    expect(screen.getByText('موجودة فيها')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('highlight-picker-h1'));
    expect(mockMutate.mock.calls[0][0]).toEqual({
      id: 'h1',
      input: { storyIds: ['a', 'b'] },
    });
    expect(screen.getByTestId('highlight-added')).toBeTruthy();
    await act(() => jest.advanceTimersByTime(1000));
    expect(onDone).toHaveBeenCalled();
  });

  it('a new highlight opens its form with the stories chosen', async () => {
    const onDone = jest.fn();
    const screen = await render(
      <HighlightPickerSheet ref={createRef()} storyIds={['a', 'b']} onDone={onDone} />,
    );
    await fireEvent.press(screen.getByTestId('highlight-picker-new'));
    expect(onDone).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/highlights/new',
      params: { storyIds: 'a,b' },
    });
  });
});
