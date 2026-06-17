import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AvatarsWorkerModule } from '../modules/avatars/avatars-worker.module';
import { WalletWorkerModule } from '../modules/wallet/wallet-worker.module';

import { bullmqModuleOptions } from './bullmq/bullmq-options';
import { configModuleOptions } from './config/config-options';
import { typeOrmModuleOptions } from './database/typeorm-options';
import { FileStorageModule } from './file-storage/file-storage.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    BullModule.forRootAsync(bullmqModuleOptions),
    FileStorageModule.forRoot(),
    TransactionModule,
    AvatarsWorkerModule,
    WalletWorkerModule,
  ],
})
export class WorkerModule {}
