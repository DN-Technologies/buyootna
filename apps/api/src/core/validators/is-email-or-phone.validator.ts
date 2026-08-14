import { registerDecorator, ValidationOptions } from 'class-validator';
import { isEmail, isPhone } from '../utils/user.utils';

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' && (isEmail(value) || isPhone(value))
          );
        },
      },
    });
  };
}
