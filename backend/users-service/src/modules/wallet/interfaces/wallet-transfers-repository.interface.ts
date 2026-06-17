import { CreateWaleltTransfer } from '../types/wallet.type';

import { WalletTransfer } from './wallet.interface';

export interface WalletTransfersRepository {
  create(createTransfer: CreateWaleltTransfer): Promise<WalletTransfer>;

  findByIdempotencyKey(
    fromWalletId: string,
    idempotencyKey: string,
  ): Promise<WalletTransfer | null>;
}
