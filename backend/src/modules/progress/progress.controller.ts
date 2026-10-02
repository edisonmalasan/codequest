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
  ActivityResponseDto,
  ChapterProgressDto,
  CourseProgressDto,
  JourneyProgressDto,
  QuestProgressDto,
  StartQuestDto,
  UseHintDto,
} from './progress.dto';
import { ProgressService } from './progress.service';

const headers = {
  'x-request-id': {
    description: 'Correlated request ID',
    schema: { type: 'string' },
  },
};

@ApiTags('progress')
@ApiBearerAuth('supabase')
@ApiHeader({ name: 'x-request-id', required: false })
@UseGuards(AuthenticationGuard, PermissionGuard)
@Controller()
export class ProgressController {
  constructor(
    @Inject(ProgressService) private readonly progress: ProgressService,
  ) {}

  @Post('quests/:slug/start')
  @Version('1')
  @RequirePermissions('progress:write:self')
  @ApiOperation({ summary: 'Record first activity for a published quest' })
  @ApiCreatedResponse({ type: ActivityResponseDto, headers })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, headers })
  start(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
    @Body() body: StartQuestDto,
  ): Promise<ActivityResponseDto> {
    return this.progress.start(principal.userId, slug, body);
  }

  @Post('quests/:slug/hints')
  @Version('1')
  @RequirePermissions('progress:write:self')
  @ApiOperation({ summary: 'Record first use of a published quest hint' })
  @ApiCreatedResponse({ type: ActivityResponseDto, headers })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, headers })
  hint(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
    @Body() body: UseHintDto,
  ): Promise<ActivityResponseDto> {
    return this.progress.useHint(principal.userId, slug, body);
  }

  @Get('quests/:slug/progress')
  @Version('1')
  @RequirePermissions('progress:read:self')
  @ApiOperation({ summary: 'Read own quest progress' })
  @ApiOkResponse({ type: QuestProgressDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  quest(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
  ): Promise<QuestProgressDto> {
    return this.progress.quest(principal.userId, slug);
  }

  @Get('chapters/:slug/progress')
  @Version('1')
  @RequirePermissions('progress:read:self')
  @ApiOperation({ summary: 'Read own chapter progress' })
  @ApiOkResponse({ type: ChapterProgressDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  chapter(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
  ): Promise<ChapterProgressDto> {
    return this.progress.chapter(principal.userId, slug);
  }

  @Get('catalog/courses/:slug/progress')
  @Version('1')
  @RequirePermissions('progress:read:self')
  @ApiOperation({ summary: 'Read own distinct Course progress' })
  @ApiOkResponse({ type: CourseProgressDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  courseProgress(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
  ): Promise<CourseProgressDto> {
    return this.progress.course(principal.userId, slug);
  }

  @Get('journeys/:slug/progress')
  @Version('1')
  @RequirePermissions('progress:read:self')
  @ApiOperation({ summary: 'Read own Journey progress' })
  @ApiOkResponse({ type: JourneyProgressDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  journey(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
  ): Promise<JourneyProgressDto> {
    return this.progress.journey(principal.userId, slug);
  }

  @Get('courses/:slug/progress')
  @Version('1')
  @RequirePermissions('progress:read:self')
  @ApiOperation({ summary: 'Read own Journey progress through Course alias' })
  @ApiOkResponse({ type: JourneyProgressDto, headers })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, headers })
  course(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('slug') slug: string,
  ): Promise<JourneyProgressDto> {
    return this.progress.journey(principal.userId, slug);
  }
}
