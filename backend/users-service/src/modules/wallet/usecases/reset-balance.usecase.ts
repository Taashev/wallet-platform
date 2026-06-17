import { Inject, Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { InternalError } from '../../../shared/errors';
import {
  CURRENCY,
  WALLET_DEFAULT_BALANCE_CENTS,
  WALLET_OPERATION_TYPE,
} from '../constants/wallet.constant';
import {
  WALLET_OPERATIONS_REPOSITORY,
  WALLET_REPOSITORY,
} from '../constants/wallet.provider';
import type { WalletOperationsRepository } from '../interfaces/wallet-operations-repository.interface';
import type { WalletRepository } from '../interfaces/wallet-repository.intreface';

@Injectable()
export class ResetWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private walletRepository: WalletRepository,
    @Inject(WALLET_OPERATIONS_REPOSITORY)
    private walletOperationsRepository: WalletOperationsRepository,
    private transactionService: TransactionService,
  ) {}

  async execute() {
    let lastWalletId: string | undefined;
    let updatedWalletsCount = 0;

    while (true) {
      const processedWalletsCount = await this.transactionService.run(
        async () => {
          const wallets = await this.walletRepository.findByCurrencyWithCursor(
            lastWalletId,
            CURRENCY.USD,
          );

          if (wallets.length === 0) {
            return 0;
          }

          lastWalletId = wallets.at(-1)?.walletId;

          const walletsToReset = wallets.filter(
            (w) => w.balance !== WALLET_DEFAULT_BALANCE_CENTS,
          );

          const resetOperations = walletsToReset.map((wallet) => {
            const diff = WALLET_DEFAULT_BALANCE_CENTS - wallet.balance;

            return {
              wallet,
              amount: Math.abs(diff),
              operationType:
                diff > 0
                  ? WALLET_OPERATION_TYPE.TRANSFER_IN
                  : WALLET_OPERATION_TYPE.TRANSFER_OUT,
            };
          });

          if (resetOperations.length > 0) {
            await this.walletOperationsRepository.createMany(
              resetOperations.map((o) => {
                return {
                  operationId: crypto.randomUUID(),
                  amount: o.amount,
                  type: o.operationType,
                  walletId: o.wallet.walletId,
                };
              }),
            );

            const updatedCount = await this.walletRepository.updateManyBalance(
              resetOperations.map((o) => o.wallet.walletId),
              WALLET_DEFAULT_BALANCE_CENTS,
            );

            if (updatedCount !== resetOperations.length) {
              throw new InternalError({
                message: `Не удалось сбросить баланс всех кошельков. Ожидалось: ${resetOperations.length}, обновлено: ${updatedCount}`,
              });
            }

            updatedWalletsCount += resetOperations.length;
          }

          return wallets.length;
        },
      );

      if (processedWalletsCount === 0) {
        break;
      }
    }

    console.log(`Кошелек пользователей сброшен: кол-во ${updatedWalletsCount}`);

    return { updatedWalletsCount };
  }
}
