import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { StreakDto } from './streak.dto';
import { StreakService } from './streak.service';

@ApiTags('gamification')
@ApiBearerAuth('supabase')
@UseGuards(AuthenticationGuard, PermissionGuard)
@Controller('streaks')
export class StreakController {
  constructor(private readonly streaks: StreakService) {}

  @Get()
  @Version('1')
  @RequirePermissions('streaks:read:self')
  @ApiOperation({ summary: 'Read own derived learner streaks' })
  @ApiOkResponse({ type: StreakDto })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto })
  current(@CurrentPrincipal() principal: AuthPrincipal): Promise<StreakDto> {
    return this.streaks.current(principal.userId);
  }
}
