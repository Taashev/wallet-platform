import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import {
  ABOUT_MAX_LENTH,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENTH,
  USERNAME_MAX_LENGTH,
} from '../../user.rules';
import {
  USERS_CONSTRAINT_EMAIL_UQ,
  USERS_CONSTRAINT_USER_ID_PK,
  USERS_CONSTRAINT_USERNAME_UQ,
} from '../constants';

@Entity({ name: 'users' })
@Unique(USERS_CONSTRAINT_EMAIL_UQ, ['email'])
@Unique(USERS_CONSTRAINT_USERNAME_UQ, ['username'])
export class UserTypeOrmEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'uuid',
    primaryKeyConstraintName: USERS_CONSTRAINT_USER_ID_PK,
  })
  userId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({
    type: 'varchar',
    length: USERNAME_MAX_LENGTH,
    nullable: false,
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: EMAIL_MAX_LENGTH,
    nullable: false,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: PASSWORD_MAX_LENTH,
    nullable: false,
  })
  password!: string;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: false,
  })
  dateOfBirth!: string;

  @Column({ type: 'varchar', length: ABOUT_MAX_LENTH, nullable: false })
  about!: string;
}
