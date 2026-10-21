import { render } from '@testing-library/react-native';

import CompanyRequestCard from '../../home/CompanyRequestCard';
import CompanyRequestListItem from '../CompanyRequestListItem';
import RequestDetailsClientCard from '../details/RequestDetailsClientCard';
import type { CompanyRequestItem } from '../types';

// While a chat opens, the tapped button shows a spinner and can't be tapped
const request = (
  overrides: Partial<CompanyRequestItem> = {},
): CompanyRequestItem => ({
  id: 'req-1',
  clientIdentityId: 'client-1',
  title: 'تمديدات كهرباء',
  clientName: 'عبد الله',
  location: 'السالمية',
  attachmentsCount: 0,
  description: 'وصف',
  status: 'pending',
  scope: 'company',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('opening a chat from a request shows a spinner', () => {
  it('home card: الرد', async () => {
    const { getByTestId, queryByText } = await render(
      <CompanyRequestCard
        request={request()}
        variant="company"
        onReply={jest.fn()}
        onDetails={jest.fn()}
        isReplying
      />,
    );
    expect(getByTestId('home-request-reply-loading-req-1')).toBeTruthy();
    expect(queryByText('الرد')).toBeNull();
    expect(getByTestId('home-request-reply-req-1').props.accessibilityState?.disabled).toBe(true);
  });

  it('requests list: ابدأ المحادثة', async () => {
    const { getByTestId } = await render(
      <CompanyRequestListItem
        request={request({ status: 'accepted' })}
        onStartChat={jest.fn()}
        isOpeningChat
      />,
    );
    expect(getByTestId('company-request-chat-loading-req-1')).toBeTruthy();
  });

  it('request details: the chat button', async () => {
    const { getByTestId } = await render(
      <RequestDetailsClientCard
        client={{ name: 'عبد الله', previousOffers: 0, rating: null, joinedDate: '' }}
        onChatPress={jest.fn()}
        isOpeningChat
      />,
    );
    expect(getByTestId('request-details-chat-loading')).toBeTruthy();
  });

  it('no spinner otherwise', async () => {
    const { getByText, queryByTestId } = await render(
      <CompanyRequestCard
        request={request()}
        variant="company"
        onReply={jest.fn()}
        onDetails={jest.fn()}
      />,
    );
    expect(getByText('الرد')).toBeTruthy();
    expect(queryByTestId('home-request-reply-loading-req-1')).toBeNull();
  });
});
