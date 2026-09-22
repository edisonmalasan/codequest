import { DynamicModule, Module } from '@nestjs/common';
import { SupabaseAuthConfig } from '../../infrastructure/config/backend-config';
import { AccountController } from './account.controller';
import { ACCOUNT_STORE, AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { AuthenticationGuard } from './authentication.guard';
import {
  AUTH_TOKEN_VERIFIER,
  SUPABASE_AUTH_CONFIG,
  SupabaseTokenVerifier,
} from './auth-token-verifier';
import { PermissionGuard } from './permission.guard';

@Module({})
export class IdentityModule {
  static register(config: SupabaseAuthConfig): DynamicModule {
    return {
      module: IdentityModule,
      controllers: [AccountController],
      providers: [
        { provide: SUPABASE_AUTH_CONFIG, useValue: config },
        { provide: AUTH_TOKEN_VERIFIER, useClass: SupabaseTokenVerifier },
        AuthenticationGuard,
        PermissionGuard,
        { provide: ACCOUNT_STORE, useClass: AccountRepository },
        AccountService,
      ],
    };
  }
}
