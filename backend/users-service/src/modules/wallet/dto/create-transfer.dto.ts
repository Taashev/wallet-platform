import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';

import { CURRENCY } from '../constants/wallet.constant';
import type { WalletCurrency } from '../types/wallet.type';

export class CreateTransferDto {
  @Expose()
  @IsUUID('4')
  recipientUserId!: string;

  @Expose()
  @IsInt()
  @Min(1)
  amount!: number;

  @Expose()
  @IsEnum(CURRENCY)
  currency!: WalletCurrency;
}
