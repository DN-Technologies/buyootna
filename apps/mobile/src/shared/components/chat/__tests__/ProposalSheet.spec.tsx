import { fireEvent, render, screen } from '@testing-library/react-native';

import ProposalSheet, { parseAmount } from '@/shared/components/chat/ProposalSheet';

// Thursday 8 Oct 2026, 14:10 local
const NOW = new Date(2026, 9, 8, 14, 10);

describe('ProposalSheet', () => {
  it('appointment: earlier times today are disabled; sends the picked day and time', async () => {
    const onSubmit = jest.fn();
    await render(
      <ProposalSheet kind="APPOINTMENT" now={NOW} onClose={jest.fn()} onSubmit={onSubmit} />,
    );
    // 14:30 is less than 30 minutes ahead; 15:00 is fine
    expect(screen.getByTestId('proposal-slot-870').props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('proposal-submit'));
    expect(onSubmit).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('proposal-day-1'));
    await fireEvent.press(screen.getByTestId('proposal-slot-990'));
    await fireEvent.changeText(screen.getByTestId('proposal-note'), ' بعد العصر ');
    await fireEvent.press(screen.getByTestId('proposal-submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      scheduledAt: new Date(2026, 9, 9, 16, 30).toISOString(),
      note: 'بعد العصر',
      counterOfId: undefined,
    });
  });

  it('offer: amount and period; a counter carries the offer it answers', async () => {
    const onSubmit = jest.fn();
    await render(
      <ProposalSheet
        kind="OFFER"
        counterOf={{ id: 'o1', kind: 'OFFER', status: 'PENDING', amount: 250000, period: 'MONTHLY' }}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText('عرض مقابل')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('proposal-amount'), '٢٤٠٠٠٠');
    await fireEvent.press(screen.getByTestId('proposal-submit'));
    expect(onSubmit).toHaveBeenCalledWith({
      amount: 240000,
      period: 'MONTHLY',
      note: undefined,
      counterOfId: 'o1',
    });
  });

  it('parses amounts with commas or Arabic digits, and refuses zero', () => {
    expect(parseAmount('250,000')).toBe(250000);
    expect(parseAmount('١٢٥٠')).toBe(1250);
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('')).toBeNull();
  });
});
