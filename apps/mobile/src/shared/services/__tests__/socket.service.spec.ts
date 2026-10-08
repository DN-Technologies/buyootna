// QA: after switching to another app and back, the open chat stopped
// receiving messages until it was reopened. A conversation room belongs to
// one socket connection, so every reconnect must join it again.

type Handler = (...args: any[]) => void;

const mockSocket = {
  connected: false,
  auth: {} as Record<string, unknown>,
  handlers: {} as Record<string, Handler[]>,
  on: jest.fn((event: string, cb: Handler) => {
    (mockSocket.handlers[event] ||= []).push(cb);
  }),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};
const fire = (event: string) =>
  (mockSocket.handlers[event] || []).forEach((cb) => cb());

const mockIo = jest.fn((..._args: unknown[]) => mockSocket);
jest.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => mockIo(...args),
}));
jest.mock('@/shared/api/api', () => ({ validateApiUrl: () => 'https://api.test' }));

let appStateListener: ((s: string) => void) | null = null;
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: (_: string, cb: (s: string) => void) => {
      appStateListener = cb;
      return { remove: jest.fn() };
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { socketService } = require('../socket.service');

describe('socketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    socketService.disconnect();
    mockSocket.connected = false;
    mockSocket.handlers = {};
  });

  it('joins remembered rooms again on every reconnect', () => {
    socketService.connect('token');
    socketService.joinConversation('c1');
    mockSocket.connected = true;
    fire('connect');
    expect(mockSocket.emit).toHaveBeenCalledWith('join_conversation', 'c1');

    mockSocket.emit.mockClear();
    mockSocket.connected = false;
    fire('disconnect');
    mockSocket.connected = true;
    fire('connect');

    expect(mockSocket.emit).toHaveBeenCalledWith('join_conversation', 'c1');
  });

  it('tells listeners about a reconnect, not the first connection', () => {
    const onReconnect = jest.fn();
    socketService.onReconnect(onReconnect);
    socketService.connect('token');

    fire('connect');
    expect(onReconnect).not.toHaveBeenCalled();

    fire('connect');
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('reuses the dropped socket (keeping its listeners) instead of a new one', () => {
    socketService.connect('token');
    socketService.connect('token-2');

    expect(mockIo).toHaveBeenCalledTimes(1);
    expect(mockSocket.auth).toEqual({ token: 'token-2' });
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('reconnects as soon as the app is back in the foreground', () => {
    socketService.connect('token');
    mockSocket.connect.mockClear();

    appStateListener?.('active');

    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('forgets a room after leaving it', () => {
    socketService.connect('token');
    socketService.joinConversation('c1');
    socketService.leaveConversation('c1');
    mockSocket.emit.mockClear();

    fire('connect');

    expect(mockSocket.emit).not.toHaveBeenCalledWith('join_conversation', 'c1');
  });
});
