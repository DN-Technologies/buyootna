import {
  OTHER_TYPE,
  requestTypeOptions,
  specialtyOfType,
} from '../serviceCatalog';

describe('specialtyOfType', () => {
  it("finds the specialty a request type is listed under", () => {
    expect(specialtyOfType('مخططات تنفيذية')).toBe('مكتب هندسي');
  });

  it('takes a specialty name as itself', () => {
    expect(specialtyOfType('مكتب هندسي')).toBe('مكتب هندسي');
  });

  it('is null outside the catalogue (an office service, «اخرى»)', () => {
    expect(specialtyOfType('بيع وشراء')).toBeNull();
    expect(specialtyOfType(OTHER_TYPE)).toBeNull();
  });
});

describe('requestTypeOptions', () => {
  it("lists a specialty's types, then «اخرى»", () => {
    const labels = requestTypeOptions('مكتب هندسي').map((o) => o.label);
    expect(labels).toContain('تصميم الواجهات');
    expect(labels[labels.length - 1]).toBe(OTHER_TYPE);
  });

  it('is empty before a specialty is chosen', () => {
    expect(requestTypeOptions('')).toEqual([]);
  });
});
