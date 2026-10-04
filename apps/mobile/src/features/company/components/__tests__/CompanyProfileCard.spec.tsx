import { fireEvent, render } from '@testing-library/react-native';

import CompanyProfileCard from '../CompanyProfileCard';

describe('CompanyProfileCard', () => {
  const defaultProps = {
    displayName: 'المنار للعقارات',
    avatarUrl: 'https://example.com/logo.png',
    accountTypeLabel: 'شركة',
    isVerified: true,
    description:
      'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.',
    location: 'السالمية • شمال غرب صليبيخات',
    onOpenAccountSelector: jest.fn(),
    onEditPress: jest.fn(),
  };

  it('renders company details and verified badge correctly', async () => {
    const { getByText } = await render(<CompanyProfileCard {...defaultProps} />);

    expect(getByText('المنار للعقارات')).toBeTruthy();
    expect(getByText('شركة')).toBeTruthy();
    expect(
      getByText(
        'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.'
      )
    ).toBeTruthy();
    expect(getByText('السالمية • شمال غرب صليبيخات')).toBeTruthy();
  });

  it('handles account selector click', async () => {
    const onOpenAccountSelector = jest.fn();
    const { getByText } = await render(
      <CompanyProfileCard
        {...defaultProps}
        onOpenAccountSelector={onOpenAccountSelector}
      />
    );

    fireEvent.press(getByText('شركة'));
    expect(onOpenAccountSelector).toHaveBeenCalledTimes(1);
  });

  it('renders a single full-width edit button (per Figma 4410:159562)', async () => {
    const onEditPress = jest.fn();
    const { getByText, queryByText } = await render(
      <CompanyProfileCard {...defaultProps} onEditPress={onEditPress} />
    );

    fireEvent.press(getByText('تعديل'));
    expect(onEditPress).toHaveBeenCalledTimes(1);

    // Preview/Share buttons were removed from the design
    expect(queryByText('معاينة')).toBeNull();
    expect(queryByText('مشاركة')).toBeNull();
  });

  it('hides description and location rows when no data is provided', async () => {
    const { queryByText } = await render(
      <CompanyProfileCard
        {...defaultProps}
        description={undefined}
        location={undefined}
      />
    );

    expect(
      queryByText(
        'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.'
      )
    ).toBeNull();
    expect(queryByText('السالمية • شمال غرب صليبيخات')).toBeNull();
  });
});
