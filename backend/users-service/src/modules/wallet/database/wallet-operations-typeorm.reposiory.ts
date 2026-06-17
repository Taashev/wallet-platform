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
    const [operation] = await this.createMany([createOperation]);
    return operation;
  }

  async createMany(
    createOperations: CreateWalletOperation[],
  ): Promise<WalletOperation[]> {
    const repository = this.transactionService.manager.getRepository(
      WalletOperationTypeOrmEntity,
    );

    const operations = repository.create(
      createOperations.map((t) => ({
        walletOperationId: t.operationId,
        amount: String(t.amount),
        operationType: t.type,
        walletTransferId: t.transferId ?? null,
        walletId: t.walletId,
      })),
    );

    await repository.insert(operations);

    return operations.map((t) => ({
      walletOperationId: t.walletOperationId,
      amount: Number(t.amount),
      operationType: t.operationType,
      walletTransferId: t.walletTransferId,
      walletId: t.walletId,
    }));
  }
}
