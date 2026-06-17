import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WALLET_QUEUE } from './constants/wallet.constant';
import {
  WalletOperationsRepositoryProvider,
  WalletRepositoryProvider,
} from './constants/wallet.provider';
import { WalletOperationTypeOrmEntity } from './database/entities/wallet-operation-typeorm.entity';
import { WalletEntity } from './entities/wallet.entity';
import { ResetWalletProcessor } from './jobs/reset-wallet.processor';
import { WalletSheduler } from './shedulers/wallet.sheduler';
import { ResetWalletUseCase } from './usecases/reset-balance.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, WalletOperationTypeOrmEntity]),
    BullModule.registerQueue({ name: WALLET_QUEUE }),
  ],
  providers: [
    WalletRepositoryProvider,
    WalletOperationsRepositoryProvider,
    ResetWalletUseCase,
    ResetWalletProcessor,
    WalletSheduler,
  ],
})
export class WalletWorkerModule {}
