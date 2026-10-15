import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import ProposalCard from '@/shared/components/chat/ProposalCard';

const offer = (over: Partial<ChatMessage> = {}, proposal = {}): ChatMessage => ({
  id: 'm1',
  type: 'OFFER',
  isMine: false,
  timestamp: '',
  createdAt: '2026-10-09T09:00:00.000Z',
  proposal: {
    id: 'o1',
    kind: 'OFFER',
    status: 'PENDING',
    amount: 250000,
    period: 'TOTAL',
    ...proposal,
  },
  ...over,
});

describe('ProposalCard', () => {
  it('the receiver can accept, decline or counter a pending offer', async () => {
    const onRespond = jest.fn();
    const onCounter = jest.fn();
    await render(
      <ProposalCard message={offer()} timestamp="" onRespond={onRespond} onCounter={onCounter} />,
    );
    expect(screen.getByTestId('proposal-detail').props.children).toBe('250,000 د.ك');
    expect(screen.getByText('بانتظار الرد')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('proposal-accept'));
    await fireEvent.press(screen.getByTestId('proposal-decline'));
    await fireEvent.press(screen.getByTestId('proposal-counter'));
    expect(onRespond.mock.calls).toEqual([['accept'], ['decline']]);
    expect(onCounter).toHaveBeenCalled();
    expect(screen.queryByTestId('proposal-cancel')).toBeNull();
  });

  it('the sender can only cancel', async () => {
    const onRespond = jest.fn();
    await render(<ProposalCard message={offer({ isMine: true })} timestamp="" onRespond={onRespond} />);
    expect(screen.queryByTestId('proposal-accept')).toBeNull();
    await fireEvent.press(screen.getByTestId('proposal-cancel'));
    expect(onRespond).toHaveBeenCalledWith('cancel');
  });

  it('no buttons once answered, or while still sending', async () => {
    const { rerender } = await render(
      <ProposalCard message={offer({}, { status: 'COUNTERED' })} timestamp="" />,
    );
    expect(screen.getByText('تم الرد بعرض مقابل')).toBeTruthy();
    expect(screen.queryByTestId('proposal-accept')).toBeNull();

    await rerender(<ProposalCard message={offer({ sending: true })} timestamp="" />);
    expect(screen.queryByTestId('proposal-accept')).toBeNull();
  });

  it('a pending appointment in the past shows it ended, without buttons', async () => {
    await render(
      <ProposalCard
        message={offer(
          { type: 'APPOINTMENT' },
          { kind: 'APPOINTMENT', amount: null, scheduledAt: '2020-01-01T10:00:00.000Z' },
        )}
        timestamp=""
      />,
    );
    expect(screen.getByText('انتهى الموعد')).toBeTruthy();
    expect(screen.queryByTestId('proposal-accept')).toBeNull();
  });

  // QA: the disclaimer under an offer started away from the card's right
  // edge, unlike the lines above it
  it('lines the disclaimer up with the offer above it, from the right', async () => {
    await render(<ProposalCard message={offer()} timestamp="" />);

    const disclaimer = screen.getByTestId('proposal-disclaimer');
    expect(disclaimer.props.children).toBe('العرض للتوثيق داخل المحادثة وليس عقداً ملزماً');
    expect(disclaimer.props.style).toEqual(screen.getByTestId('proposal-detail').props.style);
    expect(disclaimer.props.style).toEqual({ writingDirection: 'rtl' });
  });

  it('shows no disclaimer on an appointment', async () => {
    await render(
      <ProposalCard
        message={offer({ type: 'APPOINTMENT' }, { kind: 'APPOINTMENT', scheduledAt: '2026-10-20T09:00:00.000Z' })}
        timestamp=""
      />,
    );
    expect(screen.queryByTestId('proposal-disclaimer')).toBeNull();
  });
});
