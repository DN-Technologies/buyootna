import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { BlocksService } from './blocks.service';
import {
  BlockedAccountDto,
  BlockStatusDto,
  BlockUserDto,
} from './dto/block-user.dto';

@ApiTags('Blocks')
@ApiAuth()
@Controller('blocks')
@UseGuards(AuthGuard('jwt'))
export class BlocksController {
  constructor(private readonly blocks: BlocksService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Block an account: no chat either way; its conversations, stories and reviews are hidden from you',
  })
  @ApiResponse({ status: 200, type: BlockStatusDto })
  @ApiCommonErrors()
  block(@CurrentUser() reqUser: RequestUser, @Body() dto: BlockUserDto) {
    return this.blocks.block(
      reqUser.userId,
      { userId: dto.userId, identityId: dto.identityId },
      { blockerIdentityId: reqUser.identityId, reason: dto.reason },
    );
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Unblock an account' })
  @ApiResponse({ status: 200, type: BlockStatusDto })
  @ApiCommonErrors()
  unblock(
    @CurrentUser() reqUser: RequestUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.blocks.unblock(reqUser.userId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'The accounts you blocked, newest first' })
  @ApiResponse({ status: 200, type: [BlockedAccountDto] })
  @ApiCommonErrors()
  list(@CurrentUser() reqUser: RequestUser) {
    return this.blocks.list(reqUser.userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Whether you blocked this account' })
  @ApiResponse({ status: 200, type: BlockStatusDto })
  @ApiCommonErrors()
  status(
    @CurrentUser() reqUser: RequestUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.blocks.status(reqUser.userId, userId);
  }
}
