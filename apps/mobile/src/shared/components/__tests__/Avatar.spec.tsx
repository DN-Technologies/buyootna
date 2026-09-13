import { render } from '@testing-library/react-native';

import Avatar from '../Avatar';

describe('Avatar', () => {
  it('renders the given photo when a uri is provided', async () => {
    const { getByTestId, queryByTestId } = await render(
      <Avatar uri="https://example.com/photo.jpg" testID="avatar" />,
    );

    expect(getByTestId('avatar-photo').props.source).toEqual({
      uri: 'https://example.com/photo.jpg',
    });
    expect(queryByTestId('avatar-fallback')).toBeNull();
  });

  // Regression coverage for the reported bug: the default avatar must be
  // the Buyootna logo, not a plain gray box -- previously caused by a
  // fallback to a third-party placeholder URL (https://via.placeholder.com)
  // that showed nothing when the request was slow, blocked, or down.
  it.each([null, undefined, ''])(
    'renders the Buyootna logo fallback, not the photo path, when uri is %p',
    async (uri) => {
      const { getByTestId, queryByTestId } = await render(
        <Avatar uri={uri} testID="avatar" />,
      );

      expect(getByTestId('avatar-fallback')).toBeTruthy();
      expect(queryByTestId('avatar-photo')).toBeNull();
    },
  );
});
