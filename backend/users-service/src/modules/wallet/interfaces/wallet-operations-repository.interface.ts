import { CreateWalletOperation } from '../types/wallet.type';

import { WalletOperation } from './wallet.interface';

export interface WalletOperationsRepository {
  create(createOperation: CreateWalletOperation): Promise<WalletOperation>;
}
