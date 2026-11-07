import { assertSpecialtyChangeAllowed } from './persona-rules';

describe('assertSpecialtyChangeAllowed («التخصص»)', () => {
  const db = (services: number) =>
    ({
      companyService: { count: jest.fn().mockResolvedValue(services) },
    }) as never;

  it('allows setting it, keeping it, or changing it with no services', async () => {
    await expect(
      assertSpecialtyChangeAllowed(db(3), 'c1', null, 'أ'),
    ).resolves.toBeUndefined();
    await expect(
      assertSpecialtyChangeAllowed(db(3), 'c1', 'أ', 'أ'),
    ).resolves.toBeUndefined();
    await expect(
      assertSpecialtyChangeAllowed(db(3), 'c1', 'أ', undefined),
    ).resolves.toBeUndefined();
    await expect(
      assertSpecialtyChangeAllowed(db(0), 'c1', 'أ', 'ب'),
    ).resolves.toBeUndefined();
  });

  it('refuses another specialty while the company has services', async () => {
    await expect(
      assertSpecialtyChangeAllowed(db(2), 'c1', 'أ', 'ب'),
    ).rejects.toThrow('لا يمكن تغيير التخصص مع وجود خدمات منه');
  });
});
