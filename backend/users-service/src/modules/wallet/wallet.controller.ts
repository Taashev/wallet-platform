import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../shared/decorators/current-user';
import { IdempotencyKey } from '../../shared/decorators/idempotency-key';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { CurrentUserType } from '../users/types/user.type';

import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateWalletTransferUseCase } from './usecases/create-transfer.usecase';
import { GetWalletUseCase } from './usecases/get-wallet.usecase';

@Controller({ path: 'wallets', version: '1' })
export class WalletController {
  constructor(
    private getWalletUseCase: GetWalletUseCase,
    private createWalletTransferUseCase: CreateWalletTransferUseCase,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('me')
  getWallet(@CurrentUser() currentUser: CurrentUserType) {
    return this.getWalletUseCase.execute(currentUser.userId);
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('transfer')
  async transfer(
    @IdempotencyKey(new ParseUUIDPipe({ version: '4' }))
    idempotencyKey: string,
    @Body() transferDto: CreateTransferDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    await this.createWalletTransferUseCase.execute(
      currentUser.userId,
      transferDto.recipientUserId,
      transferDto.amount,
      transferDto.currency,
      idempotencyKey,
    );
  }
}
