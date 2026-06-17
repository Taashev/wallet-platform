import { Inject, Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { ConflictError, ValidationError } from '../../../shared/errors';
import { CURRENCY, WALLET_OPERATION_TYPE } from '../constants/wallet.constant';
import {
  WALLET_OPERATIONS_REPOSITORY,
  WALLET_REPOSITORY,
  WALLET_TRANSFERS_REPOSITORY,
} from '../constants/wallet.provider';
import type { WalletOperationsRepository } from '../interfaces/wallet-operations-repository.interface';
import type { WalletRepository } from '../interfaces/wallet-repository.intreface';
import type { WalletTransfersRepository } from '../interfaces/wallet-transfers-repository.interface';

@Injectable()
export class CreateWalletTransferUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private walletRepository: WalletRepository,
    @Inject(WALLET_OPERATIONS_REPOSITORY)
    private walletOperationsRepository: WalletOperationsRepository,
    @Inject(WALLET_TRANSFERS_REPOSITORY)
    private walletTransfersRepository: WalletTransfersRepository,
    private transactionService: TransactionService,
  ) {}

  async execute(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: keyof typeof CURRENCY,
    idempotencyKey: string,
  ) {
    if (fromUserId === toUserId) {
      throw new ValidationError({
        message: 'Операция завершилась ошибкой',
        expose: true,
      });
    }

    return await this.transactionService.run(async () => {
      const wallets = await this.walletRepository.getByUserIds(
        [fromUserId, toUserId],
        { currency, isLock: true },
      );

      const fromWallet = wallets.find((w) => w.userId === fromUserId);
      const toWallet = wallets.find((w) => w.userId === toUserId);

      if (!fromWallet) {
        throw new ValidationError({
          message: `Кошелек отправителя ${fromUserId} не найден, валюта ${currency}`,
          safeMessage: 'Операция завершилась ошибкой',
          expose: true,
        });
      }

      if (!toWallet) {
        throw new ValidationError({
          message: `Кошелек получателя ${toUserId} не найден, валюта ${currency}`,
          safeMessage: 'Операция завершилась ошибкой',
          expose: true,
        });
      }

      const existTransfer =
        await this.walletTransfersRepository.findByIdempotencyKey(
          fromWallet.walletId,
          idempotencyKey,
        );

      if (existTransfer !== null) {
        if (
          existTransfer.amount !== amount ||
          existTransfer.toWalletId !== toWallet.walletId ||
          existTransfer.currency !== currency
        ) {
          throw new ConflictError({
            message: `Повторная операция idempotencyKey: ${idempotencyKey} walletFrom: ${fromWallet.walletId} с измененными параметрами`,
            safeMessage:
              'Повторная операция с тем же ключом отличается от исходной',
            expose: true,
          });
        }
        return {
          amount: existTransfer.amount,
        };
      }

      if (fromWallet.balance < amount) {
        throw new ValidationError({
          message: `Недостаточно средств на балансе. Отправитель ${fromUserId}, валюта ${currency}, сумма ${amount}`,
          expose: true,
        });
      }

      fromWallet.withdraw(amount);
      toWallet.deposit(amount);

      const transfer = await this.walletTransfersRepository.create({
        transferId: crypto.randomUUID(),
        fromWalletId: fromWallet.walletId,
        toWalletId: toWallet.walletId,
        amount,
        currency,
        idempotencyKey,
      });

      await this.walletOperationsRepository.create({
        operationId: crypto.randomUUID(),
        amount,
        type: WALLET_OPERATION_TYPE.TRANSFER_OUT,
        transferId: transfer.walletTransferId,
        walletId: fromWallet.walletId,
      });

      await this.walletOperationsRepository.create({
        operationId: crypto.randomUUID(),
        amount,
        type: WALLET_OPERATION_TYPE.TRANSFER_IN,
        transferId: transfer.walletTransferId,
        walletId: toWallet.walletId,
      });

      await this.walletRepository.updateBalance(
        fromWallet.walletId,
        fromWallet.balance,
      );

      await this.walletRepository.updateBalance(
        toWallet.walletId,
        toWallet.balance,
      );

      return { amount: amount };
    });
  }
}
