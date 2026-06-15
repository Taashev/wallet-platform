import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import {
  WALLET_OPERATIONS_CONSTRAINT_CHECK_AMOUNT,
  WALLET_OPERATIONS_CONSTRAINT_WALLET_ID_FK,
  WALLET_OPERATIONS_CONSTRAINT_WALLET_OPERATION_ID_PK,
} from '../cosntant/wallet.constant';

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
  operationType!: string;

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
}
