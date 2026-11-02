import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import ReviewCardItem from '../ReviewCardItem';
import type { ReviewItem } from '../types';

const review = (over: Partial<ReviewItem> = {}): ReviewItem => ({
  id: 'r1',
  userName: 'علي',
  avatarUrl: null,
  timeAgo: 'منذ دقيقة',
  rating: 5,
  comment: 'ممتاز',
  likes: 0,
  dislikes: 0,
  ...over,
});

describe('ReviewCardItem avatar', () => {
  it("shows the reviewer's own picture", async () => {
    const { getByTestId, queryByTestId } = await render(
      <ReviewCardItem
        item={review({ avatarUrl: 'https://cdn/ali.jpg' })}
        onToggleLike={jest.fn()}
        onToggleDislike={jest.fn()}
      />,
    );
    expect(getByTestId('review-avatar-r1-photo').props.source).toEqual({
      uri: 'https://cdn/ali.jpg',
    });
    expect(queryByTestId('review-avatar-r1-fallback')).toBeNull();
  });

  it('shows the app logo placeholder when there is no picture (never a stock photo)', async () => {
    const { getByTestId, queryByTestId } = await render(
      <ReviewCardItem
        item={review({ avatarUrl: null })}
        onToggleLike={jest.fn()}
        onToggleDislike={jest.fn()}
      />,
    );
    expect(getByTestId('review-avatar-r1-fallback')).toBeTruthy();
    expect(queryByTestId('review-avatar-r1-photo')).toBeNull();
  });
});

describe('ReviewCardItem name', () => {
  it.each(['Youssef', 'علي'])('%s reads from the right', async (userName) => {
    const { getByTestId } = await render(
      <ReviewCardItem
        item={review({ userName })}
        onToggleLike={jest.fn()}
        onToggleDislike={jest.fn()}
      />,
    );
    const name = getByTestId('review-name-r1');

    expect(StyleSheet.flatten(name.props.style).writingDirection).toBe('rtl');
    expect(name.props.className ?? '').not.toContain('text-right');
  });
});

describe('ReviewCardItem report link', () => {
  const card = (isMine?: boolean) =>
    render(
      <ReviewCardItem
        item={review({ isMine })}
        onToggleLike={jest.fn()}
        onToggleDislike={jest.fn()}
        onReport={jest.fn()}
      />,
    );

  it("is offered on someone else's review", async () => {
    const { getByTestId } = await card(false);
    expect(getByTestId('review-report-r1')).toBeTruthy();
  });

  it('is offered when an older API does not say whose it is', async () => {
    const { getByTestId } = await card(undefined);
    expect(getByTestId('review-report-r1')).toBeTruthy();
  });

  it('is not offered on your own review', async () => {
    const { queryByTestId } = await card(true);
    expect(queryByTestId('review-report-r1')).toBeNull();
  });
});
