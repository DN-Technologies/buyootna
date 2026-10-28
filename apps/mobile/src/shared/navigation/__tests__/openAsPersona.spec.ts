import { router } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import { openAsPersona } from '../openAsPersona';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    canDismiss: jest.fn(() => false),
    dismissAll: jest.fn(),
  },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const individual = { id: 'ind-1', type: 'INDIVIDUAL' };
const company = { id: 'company-1', type: 'COMPANY' };
const switchIdentity = jest.fn();

function signIn(active: typeof individual) {
  useAuthStore.setState({
    activeIdentity: active,
    identities: [individual, company],
    switchIdentity,
  } as never);
}

describe('openAsPersona', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    switchIdentity.mockResolvedValue(undefined);
  });

  it('already on that persona: just opens it', async () => {
    signIn(company);
    await openAsPersona('/(company)/(requests)/r1', 'company-1');
    expect(switchIdentity).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/(company)/(requests)/r1');
  });

  it("on the owner's individual profile: switches to the company, then opens it", async () => {
    signIn(individual);
    await openAsPersona('/(company)/(requests)/r1', 'company-1');
    expect(switchIdentity).toHaveBeenCalledWith('company-1');
    expect(router.replace).toHaveBeenCalledWith('/(company)/home');
    expect(router.push).toHaveBeenCalledWith('/(company)/(requests)/r1');
  });

  it("a persona not on this account (or none): just opens it", async () => {
    signIn(individual);
    await openAsPersona('/devices', 'someone-else');
    await openAsPersona('/devices');
    expect(switchIdentity).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it('a failed switch goes back to the previous home and says so', async () => {
    signIn(individual);
    switchIdentity.mockRejectedValue(new Error('offline'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await openAsPersona('/(company)/(requests)/r1', 'company-1');

    expect(router.replace).toHaveBeenLastCalledWith('/(individual)/home');
    expect(router.push).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith(
      'تعذر تبديل الهوية',
      'تحقق من الاتصال وحاول مرة أخرى',
    );
  });
});
