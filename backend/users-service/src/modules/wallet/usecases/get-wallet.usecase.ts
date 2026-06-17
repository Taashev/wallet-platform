import { Inject, Injectable } from '@nestjs/common';

import { NotFoundError } from '../../../shared/errors';
import { WALLET_REPOSITORY } from '../constants/wallet.provider';
import type { WalletRepository } from '../interfaces/wallet-repository.intreface';

@Injectable()
export class GetWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY) private walletRepository: WalletRepository,
  ) {}

  async execute(userId: string) {
    const wallet = await this.walletRepository.getByUserId(userId);

    if (wallet === null) {
      throw new NotFoundError({ message: 'Кошелек не найден', expose: true });
    }

    return {
      walletId: wallet.walletId,
      currency: wallet.currency,
      balance: wallet.balance,
      userId: wallet.userId,
    };
  }
}
