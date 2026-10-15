import { render, screen } from '@testing-library/react-native';

import HomeFilterPills from '@/features/individual/components/home/HomeFilterPills';
import ListingTypeRadios from '@/shared/components/add-listing/ListingTypeRadios';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

// QA (Galaxy A36): 'إيجار' showed as 'ايجا' on the home filter and the add
// ad screen. Android under-measured the last Cairo glyph of these labels
const expectFullLabel = (testID: string, label: string) => {
  const text = screen.getByTestId(testID);
  expect(text.props.children).toBe(label);
  expect(text.props.numberOfLines).toBe(1);
  expect(text.props.textBreakStrategy).toBe('simple');
  expect(String(text.props.className)).toContain('px-0.5');
};

describe('the rent label is shown in full', () => {
  it('on the home filter pills', async () => {
    await render(
      <HomeFilterPills
        activeTab="properties"
        activePropFilter="rent"
        onPropFilterChange={jest.fn()}
      />,
    );
    expectFullLabel('home-filter-label-rent', 'إيجار');
    expectFullLabel('home-filter-label-sale', 'بيع');
    expectFullLabel('home-filter-label-exchange', 'بدل');
  });

  it('on the add ad listing type', async () => {
    await render(<ListingTypeRadios value="rent" onChange={jest.fn()} />);
    expectFullLabel('listing-type-label-rent', 'إيجار');
    expectFullLabel('listing-type-label-sell', 'بيع');
    expectFullLabel('listing-type-label-exchange', 'بدل');
  });
});
