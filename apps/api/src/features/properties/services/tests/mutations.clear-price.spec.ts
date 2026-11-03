import { CreatePropertyDto } from '../../dto/create-property.dto';
import { setupMutationsService } from './mutations.harness';

// Ministry of Commerce, December 2024: an advertised price is clear and
// fixed -- no «حد» / «سوم» / «مراجعة», and companies and offices give one
describe('PropertiesMutationsService clear price', () => {
  const h = setupMutationsService();
  const OFFICE = 'office-1';

  const as = (type: string) =>
    h.identity.findUnique.mockResolvedValue({
      type,
      companyData: type === 'COMPANY' ? { status: 'APPROVED' } : null,
      officeData: type === 'OFFICE' ? { status: 'APPROVED' } : null,
    });
  const ad = (over: Record<string, unknown>) =>
    ({
      images: [],
      type: 'RENT',
      category: 'APARTMENT',
      price: 450,
      description: 'شقة ثلاث غرف',
      isDraft: false,
      ...over,
    }) as unknown as CreatePropertyDto;

  beforeEach(() => {
    as('OFFICE');
    h.property.create.mockResolvedValue({ id: 'p1', status: 'ACTIVE' });
  });

  it('refuses an ad that qualifies its price, before spending anything', async () => {
    await expect(
      h.service.create(OFFICE, ad({ description: 'السعر على السوم' })),
    ).rejects.toMatchObject({ response: { code: 'PRICE_NOT_CLEAR' } });
    expect(h.quotaService.resolvePublishQuota).not.toHaveBeenCalled();
    expect(h.property.create).not.toHaveBeenCalled();
  });

  it("refuses an office's rent ad with no price", async () => {
    await expect(
      h.service.create(OFFICE, ad({ price: undefined })),
    ).rejects.toMatchObject({ response: { code: 'PRICE_REQUIRED' } });
  });

  it('lets an individual owner advertise without a price, and an exchange ad', async () => {
    as('INDIVIDUAL');
    await expect(
      h.service.create('person-1', ad({ price: undefined, isOwner: true })),
    ).resolves.toBeDefined();
    as('OFFICE');
    await expect(
      h.service.create(OFFICE, ad({ type: 'EXCHANGE', price: undefined })),
    ).resolves.toBeDefined();
  });

  it('lets a draft hold anything until it goes live', async () => {
    h.property.create.mockResolvedValue({ id: 'd1', status: 'DRAFT' });
    await expect(
      h.service.create(
        OFFICE,
        ad({
          isDraft: true,
          price: undefined,
          description: 'السعر حد 120 ألف',
        }),
      ),
    ).resolves.toBeDefined();
  });

  it('refuses publishing a draft or republishing an ad that breaks the rule', async () => {
    h.owned('DRAFT', { type: 'SALE', price: 0, description: 'شقة' }, OFFICE);
    await expect(
      h.service.update(OFFICE, 'prop-1', { isDraft: false }),
    ).rejects.toMatchObject({ response: { code: 'PRICE_REQUIRED' } });

    h.owned(
      'EXPIRED',
      { type: 'SALE', price: 90000, description: 'السعر مراجعة 90 ألف' },
      OFFICE,
    );
    await expect(h.service.renew(OFFICE, 'prop-1')).rejects.toMatchObject({
      response: { code: 'PRICE_NOT_CLEAR' },
    });
  });
});
