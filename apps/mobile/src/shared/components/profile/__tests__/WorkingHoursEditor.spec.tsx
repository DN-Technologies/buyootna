import { fireEvent, render } from '@testing-library/react-native';

import { showAlert } from '@/shared/utils/alert';
import { defaultWeek } from '@/shared/utils/workingHours';

import WorkingHoursEditor from '../WorkingHoursEditor';

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@react-native-community/datetimepicker', () => () => null);

const renderEditor = async (value = defaultWeek()) => {
  const onSave = jest.fn();
  const utils = await render(
    <WorkingHoursEditor
      visible
      value={value}
      onClose={jest.fn()}
      onSave={onSave}
    />,
  );
  return { ...utils, onSave };
};

describe('WorkingHoursEditor (like WhatsApp Business hours)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists the seven days, each open or closed', async () => {
    const { getByText, getByTestId } = await renderEditor();

    for (const day of ['الأحد', 'الاثنين', 'الجمعة', 'السبت']) {
      expect(getByText(day)).toBeTruthy();
    }
    expect(getByTestId('working-day-0-open').props.value).toBe(true);
    expect(getByTestId('working-day-5-open').props.value).toBe(false);
  });

  it('opening a closed day gives it 9:00 ص - 5:00 م, and a range can be added', async () => {
    const { getByTestId, onSave } = await renderEditor();

    await fireEvent(getByTestId('working-day-5-open'), 'valueChange', true);
    await fireEvent.press(getByTestId('working-day-5-add'));
    await fireEvent.press(getByTestId('working-hours-save'));

    const week = onSave.mock.calls[0][0];
    expect(week[5]).toEqual({
      day: 5,
      open: true,
      ranges: [
        { from: '09:00', to: '17:00' },
        { from: '18:00', to: '20:00' },
      ],
    });
  });

  it('closing a day saves it closed', async () => {
    const { getByTestId, onSave } = await renderEditor();

    await fireEvent(getByTestId('working-day-0-open'), 'valueChange', false);
    await fireEvent.press(getByTestId('working-hours-save'));

    expect(onSave.mock.calls[0][0][0].open).toBe(false);
  });

  it("won't save overlapping hours, and says why", async () => {
    const week = defaultWeek();
    week[1].ranges = [
      { from: '09:00', to: '13:00' },
      { from: '12:00', to: '15:00' },
    ];
    const { getByTestId, onSave } = await renderEditor(week);

    await fireEvent.press(getByTestId('working-hours-save'));

    expect(onSave).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'الفترات متداخلة (الاثنين)');
  });
});
