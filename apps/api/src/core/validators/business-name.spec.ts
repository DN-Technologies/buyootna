import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RegisterCompanyDto } from '../../features/company/dto/register-company.dto';
import { CreateCompanyIdentityDto } from '../../features/identities/dto/create-company-identity.dto';
import { CreateOfficeIdentityDto } from '../../features/identities/dto/create-office-identity.dto';
import { BUSINESS_NAME_MESSAGE, BUSINESS_NAME_PATTERN } from './business-name';

// QA: a company's name took numbers, emojis and symbols
describe('business name', () => {
  it.each(['البنيان للمقاولات', 'Al Bunyan', 'شركة Al Bunyan', 'شَرِكَة'])(
    'accepts %s',
    (name) => expect(BUSINESS_NAME_PATTERN.test(name)).toBe(true),
  );

  it.each(['Company 123!@#', 'شركة بيوتنا 💲', 'شركة ٣', 'Al-Bunyan'])(
    'rejects %s',
    (name) => expect(BUSINESS_NAME_PATTERN.test(name)).toBe(false),
  );

  const nameErrors = async (cls: new () => object, name: string) => {
    const errors = await validate(plainToInstance(cls, { name }));
    return errors.find((e) => e.property === 'name')?.constraints ?? {};
  };

  it.each([
    ['company sign-up', RegisterCompanyDto],
    ['adding a company', CreateCompanyIdentityDto],
    ['adding an office', CreateOfficeIdentityDto],
  ])('%s refuses such a name with the message', async (_n, cls) => {
    expect(Object.values(await nameErrors(cls, 'Company 123!@#'))).toContain(
      BUSINESS_NAME_MESSAGE,
    );
    expect(await nameErrors(cls, 'البنيان للمقاولات')).toEqual({});
  });
});
