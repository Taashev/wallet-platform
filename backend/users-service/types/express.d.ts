import 'express';

import { CurrentUserType } from '../src/modules/users/types/user.type';

declare module 'express' {
  interface Request {
    user: CurrentUserType;
  }
}
