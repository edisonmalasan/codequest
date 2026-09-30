import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { AccountResponseDto } from './account-response.dto';
import { validateTimezone } from '../gamification/streak-policy';
import {
  ACCOUNT_STORE,
  AccountRecord,
  AccountStore,
} from './account.repository';

function toResponse(account: AccountRecord): AccountResponseDto {
  return {
    id: account.id,
    timezone: account.timezone,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_STORE) private readonly repository: AccountStore,
    @Optional()
    @Inject(AnalyticsService)
    private readonly analytics?: AnalyticsService,
  ) {}

  async establish(userId: string): Promise<AccountResponseDto> {
    const account = await this.repository.establish(userId);
    if (account.newlyCreated)
      await this.analytics?.capture({
        name: 'signup_completed',
        ownerId: userId,
        factId: userId,
        occurredAt: account.createdAt,
      });
    return toResponse(account);
  }

  async findCurrent(userId: string): Promise<AccountResponseDto> {
    const account = await this.repository.findById(userId);
    if (account === undefined) {
      throw new NotFoundException('Account not established');
    }
    return toResponse(account);
  }

  async updateTimezone(
    userId: string,
    timezone: string,
  ): Promise<AccountResponseDto> {
    const account = await this.repository.updateTimezone(
      userId,
      validateTimezone(timezone),
    );
    if (!account) throw new NotFoundException('Account not established');
    return toResponse(account);
  }
}
