import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from './push.service';

describe('PushService', () => {
  let service: PushService;
  let fetchMock: jest.Mock;

  const prisma = { session: { updateMany: jest.fn() } };
  const message = { title: 't', body: 'b', data: { route: '/devices' } };

  const ok = (tickets: unknown[]) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: tickets }),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PushService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(PushService);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
  });

  it('sends one message per unique token to the Expo push API', async () => {
    fetchMock.mockResolvedValue(ok([{ status: 'ok' }, { status: 'ok' }]));

    await service.sendToTokens(
      ['ExponentPushToken[a]', 'ExponentPushToken[b]', 'ExponentPushToken[a]'],
      message,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(JSON.parse(init.body)).toEqual([
      { to: 'ExponentPushToken[a]', ...message, sound: 'default' },
      { to: 'ExponentPushToken[b]', ...message, sound: 'default' },
    ]);
  });

  it('passes a custom sound and Android channel through', async () => {
    fetchMock.mockResolvedValue(ok([{ status: 'ok' }]));

    await service.sendToTokens(['ExponentPushToken[a]'], {
      ...message,
      sound: 'buyootna_message.wav',
      channelId: 'chat-messages',
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)[0]).toMatchObject({
      sound: 'buyootna_message.wav',
      channelId: 'chat-messages',
    });
  });

  it('batches more than 100 tokens', async () => {
    fetchMock.mockResolvedValue(ok([]));
    const tokens = Array.from(
      { length: 150 },
      (_, i) => `ExponentPushToken[${i}]`,
    );

    await service.sendToTokens(tokens, message);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(100);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toHaveLength(50);
  });

  it('clears tokens Expo reports as no longer registered', async () => {
    fetchMock.mockResolvedValue(
      ok([
        { status: 'ok' },
        { status: 'error', details: { error: 'DeviceNotRegistered' } },
      ]),
    );

    await service.sendToTokens(
      ['ExponentPushToken[live]', 'ExponentPushToken[dead]'],
      message,
    );

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { pushToken: { in: ['ExponentPushToken[dead]'] } },
      data: { pushToken: null },
    });
  });

  it('does nothing without tokens', async () => {
    await service.sendToTokens([], message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never throws when Expo is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(
      service.sendToTokens(['ExponentPushToken[a]'], message),
    ).resolves.toBeUndefined();
  });
});
