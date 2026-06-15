import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import { CURRENCY } from '../constants/wallet.constant';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletRepository } from '../interfaces/wallet-repository.intreface';

import { WalletTypeOrmEntity } from './entities/wallet-typeorm.entity';

@Injectable()
@MapPostgresErrorToAppError()
export class WalletTypeOrmRepository implements WalletRepository {
  constructor(private transactionService: TransactionService) {}

  async create(userId: string) {
    const repository =
      this.transactionService.manager.getRepository(WalletTypeOrmEntity);

    const wallet = WalletEntity.create({
      walletId: crypto.randomUUID(),
      currency: CURRENCY.USD,
      userId,
    });

    const walletTypeOrmEntity = repository.create({
      walletId: wallet.walletId,
      currency: wallet.currency,
      balance: String(wallet.balance),
      userId: wallet.userId,
    });

    await repository.insert(walletTypeOrmEntity);

    return wallet;
  }
}
