import { act, fireEvent, render } from '@testing-library/react-native';

import { OfficePlanQuotaSelector } from '../OfficePlanQuotaSelector';

describe('OfficePlanQuotaSelector (Figma 4494:141833 & 4494:142107)', () => {
  it('renders title, normal and silver options with counts', async () => {
    const { getByText, getByTestId } = await render(
      <OfficePlanQuotaSelector
        selectedPlan="normal"
        onSelectPlan={jest.fn()}
        silverQuota={2}
        normalQuota={20}
      />,
    );

    expect(getByText('اختر نوع اعلانك')).toBeTruthy();
    expect(getByText('20 عادي')).toBeTruthy();
    expect(getByText('2 فضي')).toBeTruthy();
    expect(getByTestId('plan-quota-normal')).toBeTruthy();
    expect(getByTestId('plan-quota-silver')).toBeTruthy();
    expect(getByText('22 إعلانات متبقية في باقتك')).toBeTruthy();
  });

  it('triggers onSelectPlan when silver or normal card is pressed', async () => {
    const onSelectPlan = jest.fn();
    const { getByTestId } = await render(
      <OfficePlanQuotaSelector
        selectedPlan="normal"
        onSelectPlan={onSelectPlan}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('plan-quota-silver'));
    });
    expect(onSelectPlan).toHaveBeenCalledWith('silver');

    await act(async () => {
      fireEvent.press(getByTestId('plan-quota-normal'));
    });
    expect(onSelectPlan).toHaveBeenCalledWith('normal');
  });
});
