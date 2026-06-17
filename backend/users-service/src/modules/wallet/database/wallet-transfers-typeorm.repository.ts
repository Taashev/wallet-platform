import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { WalletTransfersRepository } from '../interfaces/wallet-transfers-repository.interface';
import { WalletTransfer } from '../interfaces/wallet.interface';
import { CreateWalletTransfer, WalletCurrency } from '../types/wallet.type';

import { WalletTransferTypeOrmEntity } from './entities/wallet-transfers-typeorm.entity';

type WalletTransferRow = {
  wallet_transfer_id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  currency: WalletCurrency;
  idempotency_key: string;
};

@Injectable()
export class WalletTransfersTypeOrmRepository implements WalletTransfersRepository {
  constructor(private transactionService: TransactionService) {}

  async create(createTransfer: CreateWalletTransfer): Promise<WalletTransfer> {
    const repository = this.transactionService.manager.getRepository(
      WalletTransferTypeOrmEntity,
    );

    const transferTypeOrmEntity = repository.create({
      walletTransferId: createTransfer.transferId,
      fromWalletId: createTransfer.fromWalletId,
      toWalletId: createTransfer.toWalletId,
      amount: String(createTransfer.amount),
      currency: createTransfer.currency,
      idempotencyKey: createTransfer.idempotencyKey,
    });

    await repository.insert(transferTypeOrmEntity);

    return {
      walletTransferId: transferTypeOrmEntity.walletTransferId,
      fromWalletId: transferTypeOrmEntity.fromWalletId,
      toWalletId: transferTypeOrmEntity.toWalletId,
      amount: Number(transferTypeOrmEntity.amount),
      currency: transferTypeOrmEntity.currency,
      idempotencyKey: transferTypeOrmEntity.idempotencyKey,
    };
  }

  async findByIdempotencyKey(
    fromWalletId: string,
    idempotencyKey: string,
  ): Promise<WalletTransfer | null> {
    const repository = this.transactionService.manager.getRepository(
      WalletTransferTypeOrmEntity,
    );

    const rows = await repository.query<WalletTransferRow[]>(
      `
      SELECT
        wt.wallet_transfer_id AS "wallet_transfer_id",
        wt.from_wallet_id AS "from_wallet_id",
        wt.to_wallet_id AS "to_wallet_id",
        wt.amount AS "amount",
        wt.currency AS "currency",
        wt.idempotency_key AS "idempotency_key"
      FROM wallet_transfers AS wt
      WHERE wt.from_wallet_id = $1
        AND wt.idempotency_key = $2
      `,
      [fromWalletId, idempotencyKey],
    );

    const transferRow = rows[0];

    if (!transferRow) {
      return null;
    }

    return {
      walletTransferId: transferRow.wallet_transfer_id,
      fromWalletId: transferRow.from_wallet_id,
      toWalletId: transferRow.to_wallet_id,
      amount: Number(transferRow.amount),
      currency: transferRow.currency,
      idempotencyKey: transferRow.idempotency_key,
    };
  }
}
