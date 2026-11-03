import { ForbiddenException } from '@nestjs/common';

import { AD, dto, setupMutationsService } from './mutations.harness';

// A company or office under review can prepare drafts but not go live
describe('PropertiesMutationsService approval gate', () => {
  const h = setupMutationsService();
  const COMPANY = 'company-1';

  beforeEach(() => {
    h.identity.findUnique.mockResolvedValue({
      type: 'COMPANY',
      companyData: { status: 'PENDING' },
      officeData: null,
    });
    h.property.create.mockResolvedValue({ id: 'draft-1', status: 'DRAFT' });
  });

  it('refuses publishing for a company under review, without spending a credit', async () => {
    await expect(
      h.service.create(COMPANY, { ...dto, isDraft: false }),
    ).rejects.toThrow(ForbiddenException);
    expect(h.quotaService.resolvePublishQuota).not.toHaveBeenCalled();
  });

  it('still lets a company under review save a draft', async () => {
    await expect(
      h.service.create(COMPANY, { ...dto, isDraft: true }),
    ).resolves.toBeDefined();
  });

  it('refuses publishing a draft and republishing for a company under review', async () => {
    h.owned('DRAFT', {}, COMPANY);
    await expect(
      h.service.update(COMPANY, AD, { isDraft: false }),
    ).rejects.toThrow(ForbiddenException);

    h.owned('EXPIRED', {}, COMPANY);
    await expect(h.service.renew(COMPANY, AD)).rejects.toThrow(
      ForbiddenException,
    );
    expect(h.property.updateMany).not.toHaveBeenCalled();
  });
});
