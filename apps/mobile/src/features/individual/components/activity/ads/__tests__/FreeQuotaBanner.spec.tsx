import { fireEvent, render } from '@testing-library/react-native';

import FreeQuotaBanner from '../FreeQuotaBanner';

describe('FreeQuotaBanner', () => {
  it('with a free ad left: the card and the create button', async () => {
    const { getByText } = await render(
      <FreeQuotaBanner freeAdsRemaining={1} onPressAction={jest.fn()} />,
    );

    expect(getByText('أعلن عن عقارك مجاناً')).toBeTruthy();
    expect(getByText('أنشئ إعلانك المجاني الآن')).toBeTruthy();
  });

  it('with none left: no card, only the buy button', async () => {
    const onPressAction = jest.fn();
    const { getByText, queryByText } = await render(
      <FreeQuotaBanner freeAdsRemaining={0} onPressAction={onPressAction} />,
    );

    expect(queryByText('أعلن عن عقارك مجاناً')).toBeNull();
    expect(queryByText(/إعلان مجاني/)).toBeNull();
    expect(queryByText(/استهلكت/)).toBeNull();

    fireEvent.press(getByText('اشتر باقة إعلانات'));
    expect(onPressAction).toHaveBeenCalledTimes(1);
  });
});
