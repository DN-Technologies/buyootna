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

  // With no photo: a person icon drawn locally (as the avatar pill), never a
  // third-party placeholder URL (https://via.placeholder.com) that showed a
  // plain gray box when the request was slow, blocked, or down.
  it.each([null, undefined, ''])(
    'renders the person-icon fallback, not the photo path, when uri is %p',
    async (uri) => {
      const { getByTestId, queryByTestId } = await render(
        <Avatar uri={uri} testID="avatar" />,
      );

      expect(getByTestId('avatar-fallback')).toBeTruthy();
      expect(queryByTestId('avatar-photo')).toBeNull();
    },
  );
});
