import { BadRequestException } from '@nestjs/common';

import {
  assertCleanContent,
  findBanned,
  maskBanned,
  normalizeWord,
} from './content-filter';

describe('content filter', () => {
  it('folds Arabic spelling variants, diacritics, tatweel and repeats', () => {
    expect(normalizeWord('شَرْمـوطة')).toBe('شرموطه');
    expect(normalizeWord('أإآ')).toBe('ا');
    expect(normalizeWord('FUUUCK')).toBe('fuck');
    expect(normalizeWord('sh1t')).toBe('shit');
  });

  it('finds banned words as whole words, with Arabic prefixes', () => {
    expect(findBanned('يا شرموطة')).toEqual(['شرموطة']);
    expect(findBanned('والقحبة')).toEqual(['والقحبة']);
    expect(findBanned('you are a f*** bitch')).toEqual(['bitch']);
    expect(findBanned('fucking hell')).toEqual(['fucking']);
  });

  it('leaves innocent words that contain a banned one alone', () => {
    // كس inside تكسي، كسر، اكسسوارات; dick inside dickens
    expect(findBanned('شقة قريبة من موقف التكسي، كسر بسيط، اكسسوارات')).toEqual(
      [],
    );
    expect(findBanned('Charles Dickens street, 3 rooms')).toEqual([]);
    expect(findBanned('شقة للايجار في السالمية 350 د.ك')).toEqual([]);
    expect(findBanned(null)).toEqual([]);
  });

  it('masks banned words and keeps the rest of the text', () => {
    expect(maskBanned('انت شرموط والله')).toBe('انت *** والله');
    expect(maskBanned('what the fuck, ok')).toBe('what the ***, ok');
    expect(maskBanned('مرحبا، الشقة متاحة؟')).toBe('مرحبا، الشقة متاحة؟');
  });

  it('refuses public content with a banned word', () => {
    expect(() => assertCleanContent('عنوان', 'وصف فيه قحبة')).toThrow(
      BadRequestException,
    );
    expect(() => assertCleanContent('عنوان', undefined, null)).not.toThrow();
    try {
      assertCleanContent('shit');
    } catch (e) {
      expect((e as BadRequestException).getResponse()).toMatchObject({
        code: 'OBJECTIONABLE_CONTENT',
      });
    }
  });
});
