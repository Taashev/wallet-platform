import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { WalletOperationsRepository } from '../interfaces/wallet-operations-repository.interface';
import { WalletOperation } from '../interfaces/wallet.interface';
import { CreateWalletOperation } from '../types/wallet.type';

import { WalletOperationTypeOrmEntity } from './entities/wallet-operation-typeorm.entity';

@Injectable()
export class WalletOperationsTypeOrmRepository implements WalletOperationsRepository {
  constructor(private transactionService: TransactionService) {}

  async create(
    createOperation: CreateWalletOperation,
  ): Promise<WalletOperation> {
    const repository = this.transactionService.manager.getRepository(
      WalletOperationTypeOrmEntity,
    );

    const walletOperationTypeOrmEntity = await repository.save({
      walletOperationId: createOperation.operationId,
      amount: String(createOperation.amount),
      operationType: createOperation.type,
      walletTransferId: createOperation.transferId,
      walletId: createOperation.walletId,
    });

    return {
      walletOperationId: walletOperationTypeOrmEntity.walletOperationId,
      amount: Number(walletOperationTypeOrmEntity.amount),
      operationType: walletOperationTypeOrmEntity.operationType,
      walletTransferId: walletOperationTypeOrmEntity.walletTransferId,
      walletId: walletOperationTypeOrmEntity.walletId,
    };
  }
}
