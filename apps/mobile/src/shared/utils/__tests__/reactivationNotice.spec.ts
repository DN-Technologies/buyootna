import { showAlert } from '@/shared/utils/alert';

import { notifyIfReactivated } from '../reactivationNotice';

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

describe('notifyIfReactivated', () => {
  beforeEach(() => jest.clearAllMocks());

  it('welcomes back a user whose sign-in reactivated their account', () => {
    notifyIfReactivated({ reactivated: true });

    expect(showAlert).toHaveBeenCalledWith(
      'مرحباً بعودتك',
      'تم إعادة تفعيل حسابك، وعادت إعلاناتك وخدماتك للظهور.',
    );
  });

  it('stays quiet for a normal sign-in', () => {
    notifyIfReactivated({});

    expect(showAlert).not.toHaveBeenCalled();
  });
});
