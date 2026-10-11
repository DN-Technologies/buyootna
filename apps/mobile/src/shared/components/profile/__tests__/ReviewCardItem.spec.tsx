import { render } from '@testing-library/react-native';

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
