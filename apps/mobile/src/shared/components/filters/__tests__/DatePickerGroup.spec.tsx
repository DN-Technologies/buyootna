import { fireEvent, render } from '@testing-library/react-native';

import DatePickerGroup from '../DatePickerGroup';

describe('DatePickerGroup', () => {
  const setup = async (over = {}) => {
    const props = {
      startDate: '',
      endDate: '',
      onStartPress: jest.fn(),
      onEndPress: jest.fn(),
      ...over,
    };
    const utils = await render(<DatePickerGroup {...props} />);
    return { ...utils, props };
  };

  // QA: "التاريخ الى" used to come before "التاريخ من". The row is laid out
  // right-to-left, so the first child is the one read first.
  it('puts التاريخ من before التاريخ الى', async () => {
    const { getAllByText } = await setup();

    const labels = getAllByText(/^التاريخ/).map((n) => n.props.children);
    expect(labels).toEqual(['التاريخ من', 'التاريخ الى']);
  });

  it('each field opens its own picker', async () => {
    const { getByText, props } = await setup({
      startDate: '1/6',
      endDate: '20/6',
    });

    await fireEvent.press(getByText('1/6'));
    expect(props.onStartPress).toHaveBeenCalledTimes(1);
    expect(props.onEndPress).not.toHaveBeenCalled();

    await fireEvent.press(getByText('20/6'));
    expect(props.onEndPress).toHaveBeenCalledTimes(1);
  });
});
