import { DynamicModule, Module } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CURRICULUM_CATALOG,
  CurriculumCatalog,
  loadCurriculumCatalog,
} from './content/curriculum-catalog';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';

@Module({})
export class CurriculumModule {
  static register(
    options: { catalog?: CurriculumCatalog; contentRoot?: string } = {},
  ): DynamicModule {
    return {
      module: CurriculumModule,
      controllers: [CurriculumController],
      providers: [
        {
          provide: CURRICULUM_CATALOG,
          useFactory: () =>
            options.catalog ??
            loadCurriculumCatalog(options.contentRoot ?? resolveContentRoot()),
        },
        CurriculumService,
      ],
      exports: [CurriculumService],
    };
  }
}

function resolveContentRoot(): string {
  const candidates = [
    resolve(__dirname, '../../content'),
    resolve(__dirname, '../../../content'),
  ];
  const root = candidates.find((candidate) =>
    existsSync(resolve(candidate, 'publication.yaml')),
  );
  if (!root) throw new Error('Curriculum content root is unavailable');
  return root;
}
