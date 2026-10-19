import { render } from '@testing-library/react-native';

import { defaultWeek } from '@/shared/utils/workingHours';

import CompanyWorkingHours from '../CompanyWorkingHours';

describe('CompanyWorkingHours (company profile)', () => {
  it('shows the hours the company saved, days grouped', async () => {
    const { getByText } = await render(
      <CompanyWorkingHours hours={defaultWeek()} />,
    );

    expect(getByText('مواعيد العمل')).toBeTruthy();
    expect(getByText('الأحد - الخميس: 9:00 ص - 5:00 م')).toBeTruthy();
    expect(getByText('الجمعة - السبت: مغلق')).toBeTruthy();
  });

  it('shows nothing made up when no hours are saved', async () => {
    const { queryByText } = await render(<CompanyWorkingHours hours={null} />);

    expect(queryByText('مواعيد العمل')).toBeNull();
  });
});
