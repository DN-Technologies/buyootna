import { CreatePropertyDto } from '../../dto/create-property.dto';
import { AD, dto, OWNER, setupMutationsService } from './mutations.harness';

// The category decides which fields an ad has (property-category-fields.ts)
describe('PropertiesMutationsService category fields', () => {
  const h = setupMutationsService();

  it('stores no room, bath, floor or age for land, whatever was sent', async () => {
    const land = {
      ...dto,
      category: 'LAND',
      beds: 3,
      baths: 2,
      floors: 1,
      propertyAge: 5,
    } as CreatePropertyDto;

    await h.service.create(OWNER, { ...land, isDraft: true });
    await h.service.create(OWNER, { ...land, isDraft: false });

    for (const data of h.created()) {
      expect(data).toMatchObject({
        category: 'LAND',
        beds: null,
        baths: null,
        floors: null,
        propertyAge: null,
      });
    }
  });

  // A flat has its floor number, not a floors count (requirements doc)
  it("keeps an apartment's rooms, baths and floor number", async () => {
    await h.service.create(OWNER, {
      ...dto,
      category: 'APARTMENT',
      beds: 3,
      baths: 2,
      floors: 4,
      floorNumber: 2,
      isDraft: true,
    });

    expect(h.created()[0]).toMatchObject({
      beds: 3,
      baths: 2,
      floorNumber: 2,
      floors: null,
    });
  });

  it('clears counts on an edit of an ad whose category has none', async () => {
    h.owned('ACTIVE', { category: 'FARM' });

    await h.service.update(OWNER, AD, { beds: 4 });

    expect(h.updated()[0]).toMatchObject({
      beds: null,
      baths: null,
      floors: null,
    });
  });

  it('stores the new per-category fields and the owner declaration', async () => {
    await h.service.create('person-1', {
      ...dto,
      type: 'SALE',
      category: 'LAND',
      price: 450,
      description: 'شقة ثلاث غرف',
      landUse: 'COMMERCIAL',
      allocationStatus: 'مخصص',
      beds: 3,
      isOwner: true,
      isDraft: false,
    } as unknown as CreatePropertyDto);

    expect(h.created()[0]).toMatchObject({
      landUse: 'COMMERCIAL',
      allocationStatus: 'مخصص',
      isOwner: true,
      beds: null,
    });
  });
});
