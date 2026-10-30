import { ExecutionContext, NotFoundException } from '@nestjs/common';

import { ReelsEnabledGuard } from '../reels-enabled.guard';
import { ReelsAvailabilityController } from '../reels.controller';
import { reelsEnabledFor } from '../reels.switch';

describe('reelsEnabledFor', () => {
  it('is off by default, for guests and signed-in callers', () => {
    expect(reelsEnabledFor(undefined, {})).toBe(false);
    expect(reelsEnabledFor('u1', {})).toBe(false);
  });

  it('REELS_ENABLED=true opens it to everyone, guests included', () => {
    const env = { REELS_ENABLED: 'true' };
    expect(reelsEnabledFor(undefined, env)).toBe(true);
    expect(reelsEnabledFor('u1', env)).toBe(true);
  });

  it('only exactly "true" opens it', () => {
    expect(reelsEnabledFor('u1', { REELS_ENABLED: '1' })).toBe(false);
  });

  it('otherwise only the listed testers get in', () => {
    const env = { REELS_TESTER_USER_IDS: ' u1, u2 ' };
    expect(reelsEnabledFor('u2', env)).toBe(true);
    expect(reelsEnabledFor('u3', env)).toBe(false);
    expect(reelsEnabledFor(undefined, env)).toBe(false);
  });

  it('an empty list lets nobody in, even with an empty id', () => {
    expect(reelsEnabledFor('', { REELS_TESTER_USER_IDS: '' })).toBe(false);
  });
});

describe('the routes behind the switch', () => {
  const saved = { ...process.env };
  const contextFor = (user?: { userId: string }) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    delete process.env.REELS_ENABLED;
    process.env.REELS_TESTER_USER_IDS = 'tester';
  });
  afterAll(() => {
    process.env = saved;
  });

  it('answer 404 to anyone the switch is off for', () => {
    const guard = new ReelsEnabledGuard();
    expect(() => guard.canActivate(contextFor())).toThrow(NotFoundException);
    expect(() => guard.canActivate(contextFor({ userId: 'someone' }))).toThrow(
      NotFoundException,
    );
    expect(guard.canActivate(contextFor({ userId: 'tester' }))).toBe(true);
  });

  it('availability always answers', () => {
    const controller = new ReelsAvailabilityController();
    expect(controller.availability()).toEqual({ enabled: false });
    expect(controller.availability({ userId: 'tester' } as never)).toEqual({
      enabled: true,
    });
  });
});
