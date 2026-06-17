import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import {
  CURRENCY,
  WALLET_DEFAULT_CURRENCY,
} from '../constants/wallet.constant';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletRepository } from '../interfaces/wallet-repository.intreface';
import { WalletCurrency } from '../types/wallet.type';

import { WalletTypeOrmEntity } from './entities/wallet-typeorm.entity';

type WalletRow = {
  walletId: string;
  currency: keyof typeof CURRENCY;
  balance: string;
  userId: string;
};

type UpdateBalanceRow = { balance: string };

@Injectable()
@MapPostgresErrorToAppError()
export class WalletTypeOrmRepository implements WalletRepository {
  constructor(private transactionService: TransactionService) {}

  async create(userId: string) {
    const repository =
      this.transactionService.manager.getRepository(WalletTypeOrmEntity);

    const wallet = WalletEntity.create({
      walletId: crypto.randomUUID(),
      currency: WALLET_DEFAULT_CURRENCY,
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

  async updateBalance(walletId: string, newBalance: number): Promise<boolean> {
    const count = await this.updateManyBalance([walletId], newBalance);

    return count === 1;
  }

  async updateManyBalance(
    walletIds: string[],
    newBalance: number,
  ): Promise<number> {
    if (walletIds.length === 0) {
      return 0;
    }

    const repository =
      this.transactionService.manager.getRepository(WalletTypeOrmEntity);

    const rows = await repository.query<UpdateBalanceRow[]>(
      `
      UPDATE wallets AS w
      SET balance = $2
      WHERE w.wallet_id = ANY($1::uuid[])
      RETURNING w.balance`,
      [walletIds, newBalance],
    );

    return rows.length;
  }

  async getByUserId(
    userId: string,
    currency: keyof typeof CURRENCY = WALLET_DEFAULT_CURRENCY,
  ): Promise<WalletEntity | null> {
    const repository =
      this.transactionService.manager.getRepository(WalletTypeOrmEntity);

    const conditions: string[] = ['w.user_id = $1', 'w.currency = $2'];
    const params: unknown[] = [userId, currency];

    const rows = await repository.query<WalletRow[]>(
      `
      SELECT
        w.wallet_id AS "walletId",
        w.currency AS "currency",
        w.balance AS "balance",
        w.user_id AS "userId"
      FROM wallets AS w
      WHERE ${conditions.join(' AND ')}
      `,
      params,
    );

    const row = rows[0];

    return row !== undefined
      ? WalletEntity.restore({
          walletId: row.walletId,
          currency: row.currency,
          userId: row.userId,
          balance: Number(row.balance),
        })
      : null;
  }

  async getByUserIds(
    userIds: string[],
    options?: { currency?: keyof typeof CURRENCY; isLock?: boolean },
  ): Promise<WalletEntity[]> {
    const repository =
      this.transactionService.manager.getRepository(WalletTypeOrmEntity);

    const isLock = options?.isLock ?? false;
    const currency = options?.currency ?? WALLET_DEFAULT_CURRENCY;

    const rows = await repository.query<WalletRow[]>(
      `
      SELECT
        w.wallet_id AS "walletId",
        w.currency AS "currency",
        w.balance AS "balance",
        w.user_id AS "userId"
      FROM wallets AS w
      WHERE w.user_id = ANY($1::UUID[])
      AND w.currency = $2
      ORDER BY w.wallet_id
      ${isLock ? 'FOR UPDATE' : ''}
      `,
      [userIds, currency],
    );

    return rows.map((row) =>
      WalletEntity.restore({
        walletId: row.walletId,
        currency: row.currency,
        balance: Number(row.balance),
        userId: row.userId,
      }),
    );
  }

  async findByCurrencyWithCursor(
    lastWalletId: string | undefined,
    currency: WalletCurrency,
    limit: number = 2000,
  ): Promise<Pick<WalletEntity, 'walletId' | 'balance'>[]> {
    const repository =
      this.transactionService.manager.getRepository(WalletTypeOrmEntity);

    const rows = await repository.query<WalletRow[]>(
      `
      SELECT
        w.wallet_id AS "walletId",
        w.balance AS "balance"
      FROM wallets AS w
      WHERE ($1::uuid IS NULL OR w.wallet_id > $1::uuid)
        AND w.currency = $2
      ORDER BY w.wallet_id ASC
      LIMIT $3
      FOR UPDATE SKIP LOCKED
      `,
      [lastWalletId ?? null, currency, limit],
    );

    return rows.map((row) => ({
      walletId: row.walletId,
      balance: Number(row.balance),
    }));
  }
}
