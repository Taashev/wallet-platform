import { Processor, WorkerHost } from '@nestjs/bullmq';

import { WALLET_QUEUE } from '../constants/wallet.constant';
import { ResetWalletUseCase } from '../usecases/reset-balance.usecase';

@Processor(WALLET_QUEUE, { concurrency: 1 })
export class ResetWalletProcessor extends WorkerHost {
  constructor(private resetWalletUseCase: ResetWalletUseCase) {
    super();
  }

  // исключение приводит к retry или переводит задачу в failed
  // return говорит о том что все ок, переводит задачу в completed, при этом retry не выполняется
  async process() {
    await this.resetWalletUseCase.execute();
  }
}
