import {
  defaultWeek,
  formatTime,
  readWeek,
  summarizeWeek,
  weekProblem,
  type WorkingDay,
} from '../workingHours';

describe('workingHours', () => {
  it('formats 24h times the Arabic way', () => {
    expect(formatTime('09:00')).toBe('9:00 ص');
    expect(formatTime('13:30')).toBe('1:30 م');
    expect(formatTime('00:15')).toBe('12:15 ص');
    expect(formatTime('12:00')).toBe('12:00 م');
  });

  it('groups neighbouring days with the same hours', () => {
    expect(summarizeWeek(defaultWeek())).toEqual([
      { days: 'الأحد - الخميس', hours: '9:00 ص - 5:00 م', isOpen: true },
      { days: 'الجمعة - السبت', hours: 'مغلق', isOpen: false },
    ]);
  });

  it('lists a split day with all its ranges, in time order', () => {
    const week = defaultWeek();
    week[5] = {
      day: 5,
      open: true,
      ranges: [
        { from: '16:00', to: '21:00' },
        { from: '09:00', to: '12:00' },
      ],
    };

    expect(summarizeWeek(week)[1]).toEqual({
      days: 'الجمعة',
      hours: '9:00 ص - 12:00 م، 4:00 م - 9:00 م',
      isOpen: true,
    });
  });

  it('reads the saved hours from the API or from a form, as a full week', () => {
    const saved: WorkingDay[] = [
      { day: 0, open: true, ranges: [{ from: '08:00', to: '14:00' }] },
    ];

    const week = readWeek(JSON.stringify(saved))!;
    expect(week).toHaveLength(7);
    expect(week[0].open).toBe(true);
    expect(week[3]).toEqual({ day: 3, open: false, ranges: [] });
    expect(readWeek(saved)).toEqual(week);

    expect(readWeek(null)).toBeNull();
    expect(readWeek('')).toBeNull();
    expect(readWeek('not json')).toBeNull();
  });

  it('explains what blocks saving', () => {
    expect(weekProblem(defaultWeek())).toBeNull();

    const backwards = defaultWeek();
    backwards[1].ranges = [{ from: '17:00', to: '09:00' }];
    expect(weekProblem(backwards)).toBe(
      'وقت البداية يجب أن يسبق النهاية (الاثنين)',
    );

    const overlapping = defaultWeek();
    overlapping[2].ranges = [
      { from: '09:00', to: '13:00' },
      { from: '12:00', to: '15:00' },
    ];
    expect(weekProblem(overlapping)).toBe('الفترات متداخلة (الثلاثاء)');
  });
});
