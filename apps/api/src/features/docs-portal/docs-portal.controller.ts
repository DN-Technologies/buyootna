import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocsRole } from '@prisma/client';
import type { Request } from 'express';
import type { DocsUser } from './docs-portal.constants';
import { CurrentDocsUser, DocsAuthGuard, DocsRoles } from './docs-auth.guard';
import { DocsPortalService } from './docs-portal.service';
import { DocsLoginDto } from './dto/docs-login.dto';
import { SetDocsPasswordDto } from './dto/set-docs-password.dto';

@ApiTags('Docs Portal')
// Not /docs-*: those paths belong to the Swagger UI and its Basic-Auth
@Controller('qa-portal')
export class DocsPortalController {
  constructor(private readonly docsPortal: DocsPortalService) {}

  @Post('auth/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in to the docs portal with a role password' })
  login(@Body() dto: DocsLoginDto, @Req() req: Request) {
    return this.docsPortal.login(dto.role, dto.password, dto.name, req.ip);
  }

  @Get('auth/me')
  @UseGuards(DocsAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'The signed-in docs user (role and name)' })
  me(@CurrentDocsUser() user: DocsUser) {
    return user;
  }

  @Get('roles')
  @UseGuards(DocsAuthGuard)
  @DocsRoles(DocsRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Which roles have a password, and when it was set' })
  listRoles() {
    return this.docsPortal.listRoles();
  }

  @Put('roles/:role/password')
  @UseGuards(DocsAuthGuard)
  @DocsRoles(DocsRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Set or rotate a role's password (signs that role out everywhere)",
  })
  setPassword(
    @Param('role', new ParseEnumPipe(DocsRole)) role: DocsRole,
    @Body() dto: SetDocsPasswordDto,
    @CurrentDocsUser() user: DocsUser,
  ) {
    return this.docsPortal.setPassword(role, dto.password, user.name);
  }
}
