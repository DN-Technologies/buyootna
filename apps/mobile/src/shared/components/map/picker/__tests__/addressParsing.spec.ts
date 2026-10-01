import {
  cleanDetails,
  formatDetails,
  guessDetailsFromFeature,
  normalizeArabic,
  splitBlock,
} from '../addressParsing';

describe('address parsing', () => {
  it('treats Arabic spelling variants and digits alike', () => {
    expect(normalizeArabic('الأحمدي')).toBe(normalizeArabic('الاحمدي'));
    expect(normalizeArabic('السالمية')).toBe(normalizeArabic('السالميه'));
    expect(normalizeArabic('قطعة ٥')).toBe('قطعه 5');
  });

  it('splits "قطعة N" off a query', () => {
    expect(splitBlock('السالمية قطعة 5')).toEqual({ rest: 'السالمية', block: '5' });
    expect(splitBlock('الجابرية ق ١٢')).toEqual({ rest: 'الجابرية', block: '12' });
    expect(splitBlock('حولي')).toEqual({ rest: 'حولي' });
  });

  it('guesses block, street and house from a Mapbox feature', () => {
    expect(
      guessDetailsFromFeature({
        place_type: ['address'],
        text: 'شارع أحمد الجابر',
        address: '12',
        place_name: 'شارع أحمد الجابر 12، قطعة 6، القبلة، الكويت',
      }),
    ).toEqual({ block: '6', street: 'شارع أحمد الجابر', building: '12' });
    expect(guessDetailsFromFeature({ place_type: ['locality'], text: 'حولي' })).toEqual({});
  });

  it('keeps only filled parts and formats them as one line', () => {
    expect(cleanDetails({ block: ' 6 ', street: '', building: '12' })).toEqual({
      block: '6',
      building: '12',
    });
    expect(cleanDetails({ street: ' ' })).toBeUndefined();
    expect(
      formatDetails({
        block: '6',
        street: 'أحمد الجابر',
        avenue: '3',
        building: '12',
        landmark: 'بجانب الجمعية',
      }),
    ).toBe('قطعة 6، شارع أحمد الجابر، جادة 3، منزل 12 (بجانب الجمعية)');
    expect(formatDetails({ street: 'شارع الخليج' })).toBe('شارع الخليج');
  });
});
