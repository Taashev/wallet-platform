import { WalletEntity } from '../entities/wallet.entity';

export interface WalletRepository {
  create(userId: string): Promise<WalletEntity>;
}
