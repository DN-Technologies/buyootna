import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { PulseResponseDto } from './dto/pulse-response.dto';
import { PulseService } from './pulse.service';

@ApiTags('Pulse')
@ApiAuth()
@Controller('pulse')
@UseGuards(AuthGuard('jwt'))
export class PulseController {
  constructor(private readonly pulse: PulseService) {}

  @Get('me')
  @ApiOperation({
    summary:
      "What's going on for the current profile, most pressing first (the home pill's quick view)",
  })
  @ApiResponse({ status: 200, type: PulseResponseDto })
  @ApiCommonErrors()
  mine(@CurrentUser() reqUser: RequestUser) {
    return this.pulse.forIdentity(reqUser.identityId, reqUser.identityType);
  }
}
