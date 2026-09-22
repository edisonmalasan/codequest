import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccountResponseDto } from './account-response.dto';
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
  ) {}

  async establish(userId: string): Promise<AccountResponseDto> {
    return toResponse(await this.repository.establish(userId));
  }

  async findCurrent(userId: string): Promise<AccountResponseDto> {
    const account = await this.repository.findById(userId);
    if (account === undefined) {
      throw new NotFoundException('Account not established');
    }
    return toResponse(account);
  }
}
