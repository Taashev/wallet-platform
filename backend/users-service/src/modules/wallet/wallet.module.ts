import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityModule } from '../security/security.module';

import {
  WALLET_REPOSITORY,
  WalletOperationsRepositoryProvider,
  WalletRepositoryProvider,
  WalletTransfersRepositoryProvider,
} from './constants/wallet.provider';
import { WalletOperationTypeOrmEntity } from './database/entities/wallet-operation-typeorm.entity';
import { WalletTransferTypeOrmEntity } from './database/entities/wallet-transfers-typeorm.entity';
import { WalletTypeOrmEntity } from './database/entities/wallet-typeorm.entity';
import { CreateWalletTransferUseCase } from './usecases/create-transfer.usecase';
import { GetWalletUseCase } from './usecases/get-wallet.usecase';
import { WalletController } from './wallet.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletTypeOrmEntity,
      WalletOperationTypeOrmEntity,
      WalletTransferTypeOrmEntity,
    ]),
    SecurityModule,
  ],
  controllers: [WalletController],
  providers: [
    WalletRepositoryProvider,
    WalletOperationsRepositoryProvider,
    WalletTransfersRepositoryProvider,
    GetWalletUseCase,
    CreateWalletTransferUseCase,
  ],
  exports: [WALLET_REPOSITORY],
})
export class WalletModule {}
