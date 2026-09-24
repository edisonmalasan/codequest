import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Res,
  Version,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { ApiErrorResponseDto } from '../../common/http/api-error-response.dto';
import {
  ChapterDetailDto,
  JourneyDetailDto,
  JourneySummaryDto,
  QuestDetailDto,
} from './curriculum.dto';
import { CurriculumService } from './curriculum.service';

const headers = {
  'x-request-id': {
    description: 'Correlated request ID',
    schema: { type: 'string' },
  },
};

@ApiTags('curriculum')
@ApiExtraModels(JourneySummaryDto)
@ApiHeader({ name: 'x-request-id', required: false })
@Controller()
export class CurriculumController {
  constructor(
    @Inject(CurriculumService)
    private readonly curriculum: CurriculumService,
  ) {}

  @Get('journeys')
  @Version('1')
  @ApiOperation({ summary: 'List published curriculum journeys' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(JourneySummaryDto) },
    },
    headers,
  })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  listJourneys(): JourneySummaryDto[] {
    return this.curriculum.listJourneys();
  }

  @Get('journeys/:slug')
  @Version('1')
  @ApiOperation({ summary: 'Read one published journey' })
  @ApiOkResponse({ type: JourneyDetailDto, headers })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  findJourney(@Param('slug') slug: string): JourneyDetailDto {
    return this.curriculum.findJourney(slug);
  }

  @Get('courses/:slug')
  @Version('1')
  @ApiOperation({
    summary: 'Read one published journey through the Course alias',
  })
  @ApiOkResponse({ type: JourneyDetailDto, headers })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  findCourseAlias(@Param('slug') slug: string): JourneyDetailDto {
    return this.curriculum.findJourney(slug);
  }

  @Get('chapters/:slug')
  @Version('1')
  @ApiOperation({ summary: 'Read one published chapter' })
  @ApiOkResponse({ type: ChapterDetailDto, headers })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  findChapter(@Param('slug') slug: string): ChapterDetailDto {
    return this.curriculum.findChapter(slug);
  }

  @Get('quests/:slug/assets/:contentVersion')
  @Version('1')
  @ApiOperation({ summary: 'Read one published Quest illustration' })
  @ApiQuery({ name: 'path', required: true, type: String })
  @ApiProduces('image/png', 'image/webp')
  @ApiOkResponse({
    schema: { type: 'string', format: 'binary' },
    headers,
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  findQuestAsset(
    @Param('slug') slug: string,
    @Param('contentVersion') contentVersion: string,
    @Query('path') path: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Buffer {
    const asset = this.curriculum.findQuestAsset(slug, contentVersion, path);
    reply.header('content-type', asset.mediaType);
    reply.header('cache-control', 'public, max-age=31536000, immutable');
    reply.header('x-content-type-options', 'nosniff');
    return asset.bytes;
  }

  @Get('quests/:slug')
  @Version('1')
  @ApiOperation({ summary: 'Read one published quest snapshot' })
  @ApiOkResponse({ type: QuestDetailDto, headers })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, headers })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, headers })
  findQuest(@Param('slug') slug: string): QuestDetailDto {
    return this.curriculum.findQuest(slug);
  }
}
