import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  WALLET_REPOSITORY,
  WalletRepositoryProvider,
} from './constants/wallet.provider';
import { WalletOperationTypeOrmEntity } from './database/entities/wallet-operation-typeorm.entity';
import { WalletTypeOrmEntity } from './database/entities/wallet-typeorm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletTypeOrmEntity,
      WalletOperationTypeOrmEntity,
    ]),
  ],
  providers: [WalletRepositoryProvider],
  exports: [WALLET_REPOSITORY],
})
export class WalletModule {}
