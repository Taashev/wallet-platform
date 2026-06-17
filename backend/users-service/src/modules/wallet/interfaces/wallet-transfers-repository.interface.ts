import { CreateWalletTransfer } from '../types/wallet.type';

import { WalletTransfer } from './wallet.interface';

export interface WalletTransfersRepository {
  create(createTransfer: CreateWalletTransfer): Promise<WalletTransfer>;

  findByIdempotencyKey(
    fromWalletId: string,
    idempotencyKey: string,
  ): Promise<WalletTransfer | null>;
}
