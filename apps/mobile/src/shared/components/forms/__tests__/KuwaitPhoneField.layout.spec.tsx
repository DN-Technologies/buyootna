// QA: on the company's تعديل الملف الشخصي the phone box shrank to a sliver
// beside «+965» and the number couldn't be seen. That screen passes its own
// input classes, which dropped flex-1.
import { render } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import KuwaitPhoneField from '../KuwaitPhoneField';

function Field({ inputClassName }: { inputClassName?: string }) {
  const {
    control,
    formState: { errors },
  } = useForm<{ phone: string }>({ defaultValues: { phone: '99998888' } });
  return (
    <KuwaitPhoneField
      control={control}
      errors={errors}
      name="phone"
      label="رقم الهاتف"
      requiredMessage="رقم الهاتف مطلوب"
      inputClassName={inputClassName}
    />
  );
}

const classes = (screen: Awaited<ReturnType<typeof render>>) =>
  String(screen.getByTestId('phone-input').props.className).split(/\s+/);

describe('KuwaitPhoneField layout', () => {
  it('the number fills the row beside «+965» by default', async () => {
    const screen = await render(<Field />);
    expect(classes(screen)).toContain('flex-1');
    expect(screen.getByDisplayValue('99998888')).toBeTruthy();
  });

  it("still fills it with a screen's own input look (company edit profile)", async () => {
    const companyLook =
      'h-[46px] rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right';
    const screen = await render(<Field inputClassName={companyLook} />);
    const applied = classes(screen);

    expect(applied).toContain('flex-1');
    // The screen's look is kept
    for (const c of companyLook.split(' ')) expect(applied).toContain(c);
  });
});
