import { BadRequestException } from '@nestjs/common';

import { parseWorkingHours } from '../working-hours.util';

describe('parseWorkingHours', () => {
  it('accepts the week as an array or as JSON text, in day order', () => {
    const week = [
      {
        day: 1,
        open: true,
        ranges: [
          { from: '14:00', to: '18:00' },
          { from: '09:00', to: '12:00' },
        ],
      },
      { day: 0, open: false, ranges: [{ from: '09:00', to: '12:00' }] },
    ];

    const parsed = parseWorkingHours(JSON.stringify(week));

    expect(parsed).toEqual([
      // A closed day keeps no ranges
      { day: 0, open: false, ranges: [] },
      // Ranges come back in time order
      {
        day: 1,
        open: true,
        ranges: [
          { from: '09:00', to: '12:00' },
          { from: '14:00', to: '18:00' },
        ],
      },
    ]);
    expect(parseWorkingHours(week)).toEqual(parsed);
  });

  it('null or empty clears them', () => {
    expect(parseWorkingHours(null)).toBeNull();
    expect(parseWorkingHours('')).toBeNull();
  });

  it.each([
    ['not JSON', '{oops'],
    ['not a list', { day: 0 }],
    ['an unknown day', [{ day: 7, open: false }]],
    [
      'a repeated day',
      [
        { day: 1, open: false },
        { day: 1, open: false },
      ],
    ],
    ['an open day with no hours', [{ day: 1, open: true, ranges: [] }]],
    [
      'a bad time',
      [{ day: 1, open: true, ranges: [{ from: '9am', to: '17:00' }] }],
    ],
    [
      'an end before the start',
      [{ day: 1, open: true, ranges: [{ from: '17:00', to: '09:00' }] }],
    ],
    [
      'overlapping ranges',
      [
        {
          day: 1,
          open: true,
          ranges: [
            { from: '09:00', to: '13:00' },
            { from: '12:00', to: '15:00' },
          ],
        },
      ],
    ],
    [
      'more than three ranges',
      [
        {
          day: 1,
          open: true,
          ranges: [
            { from: '06:00', to: '07:00' },
            { from: '08:00', to: '09:00' },
            { from: '10:00', to: '11:00' },
            { from: '12:00', to: '13:00' },
          ],
        },
      ],
    ],
  ])('refuses %s', (_label, input) => {
    expect(() => parseWorkingHours(input)).toThrow(BadRequestException);
  });
});
