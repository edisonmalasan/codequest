import { DynamicModule, Global, Module } from '@nestjs/common';
import { AnalyticsConfig, AnalyticsService } from './analytics.service';

@Global()
@Module({})
export class AnalyticsModule {
  static register(config: AnalyticsConfig): DynamicModule {
    return {
      module: AnalyticsModule,
      providers: [
        {
          provide: AnalyticsService,
          useFactory: () => new AnalyticsService(config),
        },
      ],
      exports: [AnalyticsService],
    };
  }
}
