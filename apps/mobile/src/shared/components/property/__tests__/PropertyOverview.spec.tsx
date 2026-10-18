import { render } from '@testing-library/react-native';

import PropertyOverview from '../PropertyOverview';

const base = {
  title: 'شقة للبيع',
  timeAgo: 'منذ 22 يوم',
  views: 8,
  area: 180,
  location: 'السالمية',
};

describe('PropertyOverview price', () => {
  it('shows the price right under the title, before the licence number', async () => {
    const { toJSON } = await render(
      <PropertyOverview
        {...base}
        type="SALE"
        price={140000}
        licenseNumber="LIC-001"
      />,
    );
    const text = JSON.stringify(toJSON());
    expect(text.indexOf('140,000')).toBeGreaterThan(-1);
    expect(text.indexOf('140,000')).toBeLessThan(text.indexOf('رقم الرخصة'));
  });

  it('says «السعر غير معلن» instead of «0 د.ك» when there is no price', async () => {
    const { getByText, queryByTestId } = await render(
      <PropertyOverview {...base} type="SALE" price={0} />,
    );
    expect(getByText('السعر غير معلن')).toBeTruthy();
    expect(queryByTestId('property-overview-price')).toBeNull();
  });
});
