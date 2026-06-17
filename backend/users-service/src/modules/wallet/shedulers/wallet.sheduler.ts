import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Queue } from 'bullmq';

import { WALLET_JOBS, WALLET_QUEUE } from '../constants/wallet.constant';

@Injectable()
export class WalletSheduler implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(WALLET_QUEUE)
    private walletQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.walletQueue.upsertJobScheduler(
      WALLET_JOBS.RESET_WALLET,
      {
        every: 1000 * 60 * 10, // каждые 10 минут
      },
      {
        name: WALLET_JOBS.RESET_WALLET,
        data: null,
        opts: { attempts: 0, removeOnComplete: true },
      },
    );
  }
}
