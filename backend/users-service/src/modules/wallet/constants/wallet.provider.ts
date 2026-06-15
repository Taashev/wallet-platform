import { Provider } from '@nestjs/common';

import { WalletTypeOrmRepository } from '../database/wallet-typeorm.repository';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export const WalletRepositoryProvider: Provider = {
  provide: WALLET_REPOSITORY,
  useClass: WalletTypeOrmRepository,
};
