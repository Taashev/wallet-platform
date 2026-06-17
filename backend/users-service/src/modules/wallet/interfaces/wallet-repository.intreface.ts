import { WalletEntity } from '../entities/wallet.entity';
import { WalletCurrency } from '../types/wallet.type';

export interface WalletRepository {
  create(userId: string): Promise<WalletEntity>;

  updateBalance(walletId: string, newBalance: number): Promise<boolean>;

  updateManyBalance(walletIds: string[], newBalance: number): Promise<number>;

  getByUserId(
    userId: string,
    currency?: WalletCurrency,
  ): Promise<WalletEntity | null>;

  getByUserIds(
    userIds: string[],
    options?: { currency?: WalletCurrency; isLock?: boolean },
  ): Promise<WalletEntity[]>;

  findByCurrencyWithCursor(
    lastWalletId: string | undefined,
    currency: WalletCurrency,
    limit?: number,
  ): Promise<Pick<WalletEntity, 'walletId' | 'balance'>[]>;
}
