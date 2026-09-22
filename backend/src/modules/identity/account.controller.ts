import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../../common/http/api-error-response.dto';
import { AccountResponseDto } from './account-response.dto';
import { AccountService } from './account.service';
import { AuthPrincipal } from './auth-principal';
import { AuthenticationGuard } from './authentication.guard';
import { CurrentPrincipal } from './current-principal';
import { PermissionGuard } from './permission.guard';
import { RequirePermissions } from './require-permissions';

const requestIdHeader = {
  'x-request-id': {
    description: 'Correlated request ID',
    schema: { type: 'string' },
  },
};

@ApiTags('account')
@ApiBearerAuth('supabase')
@ApiHeader({ name: 'x-request-id', required: false })
@UseGuards(AuthenticationGuard, PermissionGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Put()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('account:establish:self')
  @ApiOperation({ summary: 'Establish the current learner account' })
  @ApiOkResponse({ type: AccountResponseDto, headers: requestIdHeader })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 403,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 429,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 500,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  async establish(
    @CurrentPrincipal() principal: AuthPrincipal,
  ): Promise<AccountResponseDto> {
    return this.accountService.establish(principal.userId);
  }

  @Get()
  @Version('1')
  @RequirePermissions('account:read:self')
  @ApiOperation({ summary: 'Read the current learner account' })
  @ApiOkResponse({ type: AccountResponseDto, headers: requestIdHeader })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 403,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 404,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 429,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  @ApiResponse({
    status: 500,
    type: ApiErrorResponseDto,
    headers: requestIdHeader,
  })
  async findCurrent(
    @CurrentPrincipal() principal: AuthPrincipal,
  ): Promise<AccountResponseDto> {
    return this.accountService.findCurrent(principal.userId);
  }
}
