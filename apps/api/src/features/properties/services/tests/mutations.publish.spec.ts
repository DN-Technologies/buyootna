import { BadRequestException } from '@nestjs/common';

import { AD, dto, OWNER, setupMutationsService } from './mutations.harness';

// Every path that makes a listing ACTIVE notifies matching alerts; drafts
// don't. Also: what a publish stamps, and the banned-words check.
describe('PropertiesMutationsService publishing and alert matching', () => {
  const h = setupMutationsService();

  it('refuses an ad whose text has a banned word, before anything is saved (Guideline 1.2)', async () => {
    await expect(
      h.service.create(OWNER, { ...dto, description: 'شقة للايجار يا قحبة' }),
    ).rejects.toThrow(BadRequestException);
    expect(h.property.create).not.toHaveBeenCalled();

    h.owned('ACTIVE');
    await expect(
      h.service.update(OWNER, AD, { rentConditions: 'fuck off' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('notifies after publishing a new listing', async () => {
    await h.service.create(OWNER, { ...dto, isDraft: false });

    expect(h.alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(AD);
  });

  it('stamps publishedAt when an ad goes live, never on a draft', async () => {
    await h.service.create(OWNER, { ...dto, isDraft: false });
    await h.service.create(OWNER, { ...dto, isDraft: true });

    const [live, draft] = h.created();
    expect(live.publishedAt).toBeInstanceOf(Date);
    expect(draft.publishedAt).toBeUndefined();

    h.owned('DRAFT');
    await h.service.update(OWNER, AD, { isDraft: false });
    expect(h.updated()[0].publishedAt).toBeInstanceOf(Date);
  });

  it('does not notify when saving a draft', async () => {
    await h.service.create(OWNER, { ...dto, isDraft: true });

    expect(h.alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('notifies after publishing a draft', async () => {
    h.owned('DRAFT');

    await h.service.update(OWNER, AD, { isDraft: false });

    expect(h.alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(AD);
  });

  it('does not reactivate (or notify for) an edit of an archived listing', async () => {
    h.owned('EXPIRED');

    await h.service.update(OWNER, AD, { isDraft: false });

    // Going live again is renew()'s job: it spends a credit and sets dates
    expect(h.updated()[0]).toMatchObject({ status: 'EXPIRED' });
    expect(h.alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('does not notify for a plain edit of an active listing', async () => {
    h.owned('ACTIVE');

    await h.service.update(OWNER, AD, { description: 'x' });

    expect(h.alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('notifies after renewing a listing', async () => {
    h.owned('EXPIRED');

    await h.service.renew(OWNER, AD);

    expect(h.alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(AD);
  });
});
