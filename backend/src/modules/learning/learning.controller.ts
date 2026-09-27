import {
  Body,
  Controller,
  Get,
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
import {
  AttemptHistoryDto,
  AttemptResponseDto,
  CreateAttemptDto,
} from './attempt.dto';
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
@Controller('quests/:slug/attempts')
export class LearningController {
  constructor(
    @Inject(LearningService) private readonly learning: LearningService,
  ) {}

  @Post()
  @Version('1')
  @RequirePermissions('learning:submit:self')
  @ApiOperation({ summary: 'Submit a private personal-learning attempt' })
  @ApiCreatedResponse({ type: AttemptResponseDto, headers })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  submit(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
    @Body() body: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    return this.learning.submit(principal.userId, slug, body);
  }

  @Get()
  @Version('1')
  @RequirePermissions('learning:read:self')
  @ApiOperation({
    summary: 'Read current learner attempt history for a published quest',
  })
  @ApiOkResponse({ type: AttemptHistoryDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  history(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
  ): Promise<AttemptHistoryDto> {
    return this.learning.history(principal.userId, slug);
  }
}
