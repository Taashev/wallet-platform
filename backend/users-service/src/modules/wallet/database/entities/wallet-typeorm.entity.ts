import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UserTypeOrmEntity } from '../../../users/database/entities/user-typeorm.entity';
import { CURRENCY } from '../../constants/wallet.constant';
import {
  WALLET_CONSTRAINT_CHECK_BALANCE,
  WALLET_CONSTRAINT_UNIQUE_USERID_CURRENCY,
  WALLET_CONSTRAINT_USER_ID_FK,
  WALLET_CONSTRAINT_WALLET_ID_PK,
} from '../cosntant/wallet.constant';

@Entity({ name: 'wallets' })
@Unique(WALLET_CONSTRAINT_UNIQUE_USERID_CURRENCY, ['userId', 'currency'])
@Check(WALLET_CONSTRAINT_CHECK_BALANCE, 'balance >= 0')
export class WalletTypeOrmEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'wallet_id',
    primaryKeyConstraintName: WALLET_CONSTRAINT_WALLET_ID_PK,
  })
  walletId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 3, nullable: false })
  currency!: keyof typeof CURRENCY;

  @Column({ type: 'bigint', nullable: false })
  balance!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  userId!: string;

  @ManyToOne(() => UserTypeOrmEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: WALLET_CONSTRAINT_USER_ID_FK,
  })
  user!: UserTypeOrmEntity;
}
