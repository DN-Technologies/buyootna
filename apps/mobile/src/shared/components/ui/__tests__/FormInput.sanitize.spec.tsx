import { fireEvent, render } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import FormInput from '@/shared/components/ui/FormInput';
import { keepBusinessNameChars } from '@/shared/utils/businessName';

let latest: { name?: string } = {};

function NameField({ sanitize }: { sanitize?: (t: string) => string }) {
  const { control, watch } = useForm<{ name: string }>();
  latest = watch();
  return (
    <FormInput
      control={control}
      name="name"
      label="اسم الشركة"
      placeholder="البنيان للمقاولات"
      sanitize={sanitize}
    />
  );
}

// QA: «اسم الشركة» let numbers, emojis and symbols be typed
describe('FormInput sanitize', () => {
  it('drops what the name field does not take, as it is typed', async () => {
    const { getByPlaceholderText } = await render(
      <NameField sanitize={keepBusinessNameChars} />,
    );
    await fireEvent.changeText(
      getByPlaceholderText('البنيان للمقاولات'),
      'شركة بيوتنا 💲 123',
    );
    expect(latest.name).toBe('شركة بيوتنا  ');
  });

  it('leaves other fields as typed', async () => {
    const { getByPlaceholderText } = await render(<NameField />);
    await fireEvent.changeText(getByPlaceholderText('البنيان للمقاولات'), 'a1!');
    expect(latest.name).toBe('a1!');
  });
});
