import { Controller, Get, Version } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../../common/http/api-error-response.dto';
import { HealthResponseDto } from './health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Report CodeQuest API process readiness' })
  @ApiHeader({ name: 'x-request-id', required: false })
  @ApiOkResponse({
    type: HealthResponseDto,
    headers: {
      'x-request-id': {
        description: 'Correlated request ID',
        schema: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto })
  check(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'codequest-api',
      version: '1',
    };
  }
}
