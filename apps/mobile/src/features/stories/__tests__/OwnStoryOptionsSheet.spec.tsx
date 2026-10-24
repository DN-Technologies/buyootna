import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import OwnStoryOptionsSheet from '../components/OwnStoryOptionsSheet';

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
        { id: 'h1', title: 'مشاريعنا', coverUrl: null, stories: [{ id: 'old' }] },
        { id: 'h2', title: 'عروض', coverUrl: null, stories: [{ id: 's1' }] },
      ],
    },
  }),
  useHighlightMutations: () => ({ update: { mutate: mockMutate } }),
}));

const setup = (inHighlight = false) => {
  const props = {
    storyId: 's1',
    inHighlight,
    onRemoveFromHighlight: jest.fn(),
    onDelete: jest.fn(),
    onDismiss: jest.fn(),
  };
  return { props, screen: render(<OwnStoryOptionsSheet ref={createRef()} {...props} />) };
};

describe('OwnStoryOptionsSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('adds the story at the end of a picked highlight; one that has it is marked', async () => {
    const { screen } = setup();
    const s = await screen;
    await fireEvent.press(s.getByTestId('own-story-add-highlight'));
    expect(s.getByText('موجودة فيها')).toBeTruthy();
    await fireEvent.press(s.getByTestId('own-story-pick-h1'));
    expect(mockMutate).toHaveBeenCalledWith(
      { id: 'h1', input: { storyIds: ['old', 's1'] } },
      expect.any(Object),
    );
  });

  it('a new highlight opens its form with the story chosen', async () => {
    const s = await setup().screen;
    await fireEvent.press(s.getByTestId('own-story-add-highlight'));
    await fireEvent.press(s.getByTestId('own-story-new-highlight'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/highlights/new',
      params: { storyIds: 's1' },
    });
  });

  it('delete hands over to its confirmation once closed (the story stays paused)', async () => {
    const { props, screen } = setup();
    const s = await screen;
    await fireEvent.press(s.getByTestId('own-story-delete'));
    expect(props.onDelete).toHaveBeenCalled();
    expect(props.onDismiss).not.toHaveBeenCalled();
  });

  it('from a highlight: take it out instead of adding', async () => {
    const { props, screen } = setup(true);
    const s = await screen;
    expect(s.queryByTestId('own-story-add-highlight')).toBeNull();
    await fireEvent.press(s.getByTestId('own-story-remove-highlight'));
    expect(props.onRemoveFromHighlight).toHaveBeenCalled();
  });
});
