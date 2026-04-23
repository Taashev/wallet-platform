import {
  registerDecorator,
  ValidateIf,
  ValidationOptions,
} from 'class-validator';

import { DATE_OF_BIRTH_REGEXP } from '../../modules/users/user.rules';

export const IsISODateString = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isISODateString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          if (!DATE_OF_BIRTH_REGEXP.test(value)) {
            return false;
          }

          return true;
        },

        defaultMessage() {
          return 'Дата должна быть в формате YYYY-MM-DD';
        },
      },
    });
  };
};

export const IsOptionalButNotNull = () => {
  return ValidateIf((_, value) => value !== undefined);
};
