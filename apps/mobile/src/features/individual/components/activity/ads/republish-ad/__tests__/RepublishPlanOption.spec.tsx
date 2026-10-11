import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import RepublishPlanOption from '../RepublishPlanOption';

// Records the style the gradient is rendered with
const mockGradientStyles: unknown[] = [];
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: any) => {
      mockGradientStyles.push(style);
      return <View>{children}</View>;
    },
  };
});

describe('RepublishPlanOption', () => {
  beforeEach(() => {
    mockGradientStyles.length = 0;
  });

  it('renders the selected featured card as a sized gradient', async () => {
    await render(
      <RepublishPlanOption
        planType="FEATURED"
        title="إعلان مميز"
        balanceLabel="رصيدك: 2 إعلان"
        isSelected
        onPress={jest.fn()}
      />,
    );

    // expo-linear-gradient ignores className; without a style it collapses
    expect(StyleSheet.flatten(mockGradientStyles[0])).toMatchObject({
      height: 74,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
    });
  });

  it('uses no gradient when not selected, and reports taps', async () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = await render(
      <RepublishPlanOption
        planType="REGULAR"
        title="إعلان عادي"
        balanceLabel="رصيدك: 3 إعلانات"
        isSelected={false}
        onPress={onPress}
      />,
    );

    expect(getByText('رصيدك: 3 إعلانات')).toBeTruthy();
    expect(mockGradientStyles).toHaveLength(0);
    await fireEvent.press(getByTestId('republish-option-regular'));
    expect(onPress).toHaveBeenCalledWith('REGULAR');
  });
});
