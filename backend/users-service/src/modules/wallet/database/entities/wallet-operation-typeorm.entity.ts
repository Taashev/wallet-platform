import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import type { WalletOperationType } from '../../types/wallet.type';
import {
  WALLET_OPERATIONS_CONSTRAINT_CHECK_AMOUNT,
  WALLET_OPERATIONS_CONSTRAINT_WALLET_ID_FK,
  WALLET_OPERATIONS_CONSTRAINT_WALLET_OPERATION_ID_PK,
  WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK,
} from '../cosntant/wallet.constant';

import { WalletTransferTypeOrmEntity } from './wallet-transfers-typeorm.entity';
import { WalletTypeOrmEntity } from './wallet-typeorm.entity';

@Check(WALLET_OPERATIONS_CONSTRAINT_CHECK_AMOUNT, 'amount != 0')
@Entity({ name: 'wallet_operations' })
export class WalletOperationTypeOrmEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'wallet_operation_id',
    primaryKeyConstraintName:
      WALLET_OPERATIONS_CONSTRAINT_WALLET_OPERATION_ID_PK,
  })
  walletOperationId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'bigint', nullable: false })
  amount!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'operation_type',
    nullable: false,
  })
  operationType!: WalletOperationType;

  @Column({ type: 'uuid', name: 'wallet_transfer_id', nullable: true })
  walletTransferId!: string | null;

  @Column({ type: 'uuid', name: 'wallet_id', nullable: false })
  walletId!: string;

  @ManyToOne(() => WalletTypeOrmEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'wallet_id',
    foreignKeyConstraintName: WALLET_OPERATIONS_CONSTRAINT_WALLET_ID_FK,
  })
  wallet!: WalletTypeOrmEntity;

  @ManyToOne(() => WalletTransferTypeOrmEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'wallet_transfer_id',
    foreignKeyConstraintName:
      WALLET_OPERATIONS_CONSTRAINT_WALLET_TRANSFER_ID_FK,
  })
  walletTransfer!: WalletTransferTypeOrmEntity | null;
}
