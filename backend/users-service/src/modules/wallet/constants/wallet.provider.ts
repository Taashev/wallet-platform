import { Provider } from '@nestjs/common';

import { WalletOperationsTypeOrmRepository } from '../database/wallet-operations-typeorm.reposiory';
import { WalletTransfersTypeOrmRepository } from '../database/wallet-transfers-typeorm.repository';
import { WalletTypeOrmRepository } from '../database/wallet-typeorm.repository';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export const WALLET_OPERATIONS_REPOSITORY = Symbol(
  'WALLET_OPERATIONS_REPOSITORY',
);

export const WALLET_TRANSFERS_REPOSITORY = Symbol(
  'WALLET_TRANSFERS_REPOSITORY',
);

export const WalletRepositoryProvider: Provider = {
  provide: WALLET_REPOSITORY,
  useClass: WalletTypeOrmRepository,
};

export const WalletOperationsRepositoryProvider: Provider = {
  provide: WALLET_OPERATIONS_REPOSITORY,
  useClass: WalletOperationsTypeOrmRepository,
};

export const WalletTransfersRepositoryProvider: Provider = {
  provide: WALLET_TRANSFERS_REPOSITORY,
  useClass: WalletTransfersTypeOrmRepository,
};
