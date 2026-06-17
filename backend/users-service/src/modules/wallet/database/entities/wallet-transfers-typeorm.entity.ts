import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import type { WalletCurrency } from '../../types/wallet.type';
import {
  WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK,
  WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK,
  WALLET_TRANSFERS_CONSTRAINT_UNIQUE_IDEMPOTENCY_KEY,
  WALLET_TRANSFERS_CONSTRAINT_WALLET_TRANSFER_ID_PK,
} from '../cosntant/wallet.constant';

import { WalletTypeOrmEntity } from './wallet-typeorm.entity';

@Unique(WALLET_TRANSFERS_CONSTRAINT_UNIQUE_IDEMPOTENCY_KEY, [
  'fromWalletId',
  'idempotencyKey',
])
@Entity({ name: 'wallet_transfers' })
export class WalletTransferTypeOrmEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'wallet_transfer_id',
    primaryKeyConstraintName: WALLET_TRANSFERS_CONSTRAINT_WALLET_TRANSFER_ID_PK,
  })
  walletTransferId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'uuid', name: 'from_wallet_id', nullable: false })
  fromWalletId!: string;

  @Column({ type: 'uuid', name: 'to_wallet_id', nullable: false })
  toWalletId!: string;

  @Column({ type: 'bigint', nullable: false })
  amount!: string;

  @Column({ type: 'varchar', length: 3, nullable: false })
  currency!: WalletCurrency;

  @Column({ type: 'uuid', name: 'idempotency_key', nullable: false })
  idempotencyKey!: string;

  @ManyToOne(() => WalletTypeOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'from_wallet_id',
    foreignKeyConstraintName: WALLET_TRANSFERS_CONSTAINT_FROM_WALLET_ID_FK,
  })
  fromWallet!: WalletTypeOrmEntity;

  @ManyToOne(() => WalletTypeOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'to_wallet_id',
    foreignKeyConstraintName: WALLET_TRANSFERS_CONSTAINT_TO_WALLET_ID_FK,
  })
  toWallet!: WalletTypeOrmEntity;
}
