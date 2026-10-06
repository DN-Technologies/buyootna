import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SafeBottomSheetView from '../SafeBottomSheetView';

jest.mock('@gorhom/bottom-sheet');

describe('SafeBottomSheetView', () => {
  it('reserves the bottom inset below the sheet content', async () => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({
      top: 0,
      bottom: 34,
      left: 0,
      right: 0,
    });

    const { toJSON } = await render(
      <SafeBottomSheetView>
        <Text>محتوى</Text>
      </SafeBottomSheetView>,
    );

    const tree = toJSON() as { children: { props: { style?: unknown } }[] };
    const spacer = tree.children.at(-1)!;
    expect(spacer.props.style).toEqual({ height: 34 });
  });
});
