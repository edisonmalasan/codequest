import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
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
import { AttemptResponseDto, CreateAttemptDto } from './attempt.dto';
import { LearningService } from './learning.service';

const headers = {
  'x-request-id': {
    description: 'Correlated request ID',
    schema: { type: 'string' },
  },
};

@ApiTags('learning')
@ApiBearerAuth('supabase')
@ApiHeader({ name: 'x-request-id', required: false })
@UseGuards(AuthenticationGuard, PermissionGuard)
@Controller('guest-import')
export class GuestImportController {
  constructor(
    @Inject(LearningService) private readonly learning: LearningService,
  ) {}

  @Post(':questId')
  @Version('1')
  @RequirePermissions('learning:submit:self')
  @ApiOperation({
    summary: 'Import a provisional guest check into this account',
  })
  @ApiCreatedResponse({ type: AttemptResponseDto, headers })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  importOne(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('questId') questId: string,
    @Body() body: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    return this.learning.importGuest(principal.userId, questId, body);
  }
}
