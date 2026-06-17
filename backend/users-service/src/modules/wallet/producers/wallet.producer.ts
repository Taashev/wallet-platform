import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bullmq';

import { WALLET_JOBS, WALLET_QUEUE } from '../constants/wallet.constant';

@Injectable()
export class WalletProducer {
  constructor(
    @InjectQueue(WALLET_QUEUE)
    private walletQueue: Queue,
  ) {}

  async sendResetWallet() {
    await this.walletQueue.add(WALLET_JOBS.RESET_WALLET, null, {
      jobId: crypto.randomUUID(),
      attempts: 0,
    });
  }
}
