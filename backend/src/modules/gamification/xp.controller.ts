import { Controller, Get, Inject, UseGuards, Version } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../../common/http/api-error-response.dto';
import { AuthPrincipal } from '../identity/auth-principal';
import { AuthenticationGuard } from '../identity/authentication.guard';
import { CurrentPrincipal } from '../identity/current-principal';
import { PermissionGuard } from '../identity/permission.guard';
import { RequirePermissions } from '../identity/require-permissions';
import { XpTotalDto } from './xp.dto';
import { XpService } from './xp.service';

@ApiTags('gamification')
@ApiBearerAuth('supabase')
@ApiHeader({ name: 'x-request-id', required: false })
@UseGuards(AuthenticationGuard, PermissionGuard)
@Controller('xp')
export class XpController {
  constructor(@Inject(XpService) private readonly xp: XpService) {}

  @Get()
  @Version('1')
  @RequirePermissions('xp:read:self')
  @ApiOperation({
    summary: 'Read own accepted XP and derived provisional level',
  })
  @ApiOkResponse({ type: XpTotalDto })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto })
  total(@CurrentPrincipal() principal: AuthPrincipal): Promise<XpTotalDto> {
    return this.xp.total(principal.userId);
  }
}
