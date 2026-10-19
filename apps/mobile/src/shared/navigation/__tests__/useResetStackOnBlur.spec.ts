import { renderHook } from '@testing-library/react-native';

import { useResetStackOnBlur } from '../useResetStackOnBlur';

const mockListeners: Record<string, () => void> = {};
const mockDispatch = jest.fn();
let mockTabsState: unknown;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    addListener: (event: string, listener: () => void) => {
      mockListeners[event] = listener;
      return jest.fn();
    },
    dispatch: mockDispatch,
    getState: () => mockTabsState,
  }),
  useRoute: () => ({ key: 'more-key' }),
}));

describe('useResetStackOnBlur', () => {
  it("forgets the nested stack's screens when its tab is left", async () => {
    await renderHook(() => useResetStackOnBlur());

    mockListeners.blur();

    // The dispatched action is built from the tabs' current state
    const build = mockDispatch.mock.calls[0][0];
    const tabsState = {
      key: 'tabs',
      index: 0,
      routes: [
        { key: 'home-key', name: 'home', state: { index: 0 } },
        {
          key: 'more-key',
          name: '(more)',
          state: { index: 1, routes: [{ name: 'add-project' }, { name: 'add-service' }] },
        },
      ],
    };
    const action = build(tabsState);

    expect(action.type).toBe('RESET');
    const routes = action.payload.routes;
    // Only this stack loses its screens; the other tabs keep theirs
    expect(routes[1].state).toBeUndefined();
    expect(routes[0].state).toEqual({ index: 0 });
  });

  it('entering the group keeps only the screen just opened', async () => {
    mockDispatch.mockClear();
    await renderHook(() => useResetStackOnBlur());
    mockTabsState = {
      routes: [
        {
          key: 'more-key',
          name: '(more)',
          // An إضافة مشروع left underneath, then تعديل الملف opened
          state: {
            key: 'more-stack',
            index: 1,
            routes: [
              { key: 'p', name: 'add-project' },
              { key: 'e', name: 'company-edit-profile' },
            ],
          },
        },
      ],
    };

    mockListeners.focus();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET',
        target: 'more-stack',
        payload: expect.objectContaining({
          index: 0,
          routes: [{ key: 'e', name: 'company-edit-profile' }],
        }),
      }),
    );
  });

  it('leaves a single-screen stack alone on entering', async () => {
    mockDispatch.mockClear();
    await renderHook(() => useResetStackOnBlur());
    mockTabsState = {
      routes: [
        {
          key: 'more-key',
          state: { key: 'more-stack', index: 0, routes: [{ key: 'e' }] },
        },
      ],
    };

    mockListeners.focus();

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
