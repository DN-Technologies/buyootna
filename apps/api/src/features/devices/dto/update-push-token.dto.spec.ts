import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePushTokenDto } from './update-push-token.dto';

const errorsFor = async (token: unknown) =>
  validate(plainToInstance(UpdatePushTokenDto, { token }));

describe('UpdatePushTokenDto', () => {
  it.each(['ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', 'ExpoPushToken[abc]'])(
    'accepts an Expo push token (%s)',
    async (token) => {
      expect(await errorsFor(token)).toHaveLength(0);
    },
  );

  it('accepts null to clear the token', async () => {
    expect(await errorsFor(null)).toHaveLength(0);
  });

  it.each(['not-a-token', 'ExponentPushToken[]', 42, ''])(
    'rejects %p',
    async (token) => {
      expect(await errorsFor(token)).not.toHaveLength(0);
    },
  );
});
