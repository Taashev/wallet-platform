import { PasswordService } from '../../modules/security/password.service';

export type PasswordServiceMock = jest.Mocked<
  Pick<PasswordService, 'compare' | 'hash'>
>;

export const createPasswordServiceMock = (): PasswordServiceMock => ({
  compare: jest.fn(),
  hash: jest.fn(),
});
