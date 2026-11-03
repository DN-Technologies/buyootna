import { Prisma } from '@prisma/client';

import { CreatePropertyDto } from '../../dto/create-property.dto';
import {
  AD,
  OWNER,
  setupMutationsService,
  SILVER_QUOTA,
  uniqueViolation,
} from './mutations.harness';

// A publish repeated after a lost response or a double tap must not spend
// the package twice (QA: "valid package rejected as invalid or empty")
describe('PropertiesMutationsService repeated publish', () => {
  const h = setupMutationsService();

  const key = '0b6f3a52-6a4e-4c39-9f0e-5a1f6a0d2c11';
  const publish = {
    images: [],
    isDraft: false,
    planSlotId: 'slot-silver',
    submissionKey: key,
  } as unknown as CreatePropertyDto;

  beforeEach(() => {
    h.quotaService.resolvePublishQuota.mockResolvedValue({
      ...SILVER_QUOTA,
      featuredDays: 0,
      prioritySearch: false,
    });
  });

  // Finds the ad by its key, and nothing for the referenceNumber check
  const byKey = (found: () => unknown) =>
    h.property.findUnique.mockImplementation(
      (args: { where: { identityId_submissionKey?: unknown } }) =>
        Promise.resolve(args.where.identityId_submissionKey ? found() : null),
    );

  it('stores the key with the new ad', async () => {
    await h.service.create(OWNER, publish);

    expect(h.created()[0].submissionKey).toBe(key);
  });

  it('returns the ad already created for a repeated key, spending nothing', async () => {
    const existing = { id: AD, status: 'ACTIVE' };
    byKey(() => existing);

    const result = await h.service.create(OWNER, publish);

    expect(result).toEqual({
      message: 'تم إضافة الاعلان بنجاح!',
      property: existing,
    });
    expect(h.property.findUnique).toHaveBeenCalledWith({
      where: {
        identityId_submissionKey: { identityId: OWNER, submissionKey: key },
      },
    });
    expect(h.quotaService.resolvePublishQuota).not.toHaveBeenCalled();
    expect(h.property.create).not.toHaveBeenCalled();
  });

  it('answers the loser of two concurrent identical publishes with the winner', async () => {
    const winner = { id: AD, status: 'ACTIVE' };
    let keyLookups = 0;
    // Not there yet on the first look; the winner committed by the retry
    byKey(() => (++keyLookups === 1 ? null : winner));
    h.property.create.mockRejectedValue(uniqueViolation());

    const result = await h.service.create(OWNER, publish);

    expect(result.property).toBe(winner);
    expect(h.alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('does not hide a unique error when no key was sent', async () => {
    h.property.create.mockRejectedValue(uniqueViolation());

    await expect(
      h.service.create(OWNER, { ...publish, submissionKey: undefined }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });

  it('never stores a key on an edit', async () => {
    h.owned('ACTIVE');

    await h.service.update(OWNER, AD, { description: 'x', submissionKey: key });

    expect(h.updated()[0]).not.toHaveProperty('submissionKey');
  });

  it('spends once when a draft is published twice at the same time', async () => {
    h.owned('DRAFT');
    // The other request already claimed the draft
    h.property.updateMany.mockResolvedValue({ count: 0 });
    h.property.findUniqueOrThrow.mockResolvedValue({
      id: AD,
      status: 'ACTIVE',
    });

    const result = await h.service.update(OWNER, AD, { isDraft: false });

    expect(h.property.updateMany).toHaveBeenCalledWith({
      where: { id: AD, status: 'DRAFT' },
      data: { status: 'ACTIVE' },
    });
    expect(h.quotaService.resolvePublishQuota).not.toHaveBeenCalled();
    expect(result.property).toEqual({ id: AD, status: 'ACTIVE' });
  });
});
