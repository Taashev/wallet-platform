import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';

import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import { ActiveProfilesQueryDto } from './dto/active-profiles-query.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { FindActiveProfilesUseCase } from './usecases/find-active-profiles.usecase';

@ApiTags('Profiles')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
})
@Controller({ path: 'profiles', version: '1' })
export class ProfilesController {
  constructor(private findActiveProfilesUseCase: FindActiveProfilesUseCase) {}

  @ApiOperation({ summary: 'Получить список активных профилей' })
  @ApiOkResponse({ type: [ProfileResponseDto] })
  @UseGuards(JwtAccessGuard)
  @Get('active')
  async getActiveProfiles(@Query() query: ActiveProfilesQueryDto) {
    const profiles = await this.findActiveProfilesUseCase.execute(
      query.minAge,
      query.maxAge,
      query,
    );

    return plainToInstance(ProfileResponseDto, profiles, {
      excludeExtraneousValues: true,
      groups: ['public'],
    });
  }
}
