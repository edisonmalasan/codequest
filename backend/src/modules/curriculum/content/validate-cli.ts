import { resolve } from 'node:path';
import { validateCurriculum } from './validate-curriculum';

const root = resolve(
  process.env.CODEQUEST_CONTENT_ROOT ?? resolve(process.cwd(), 'content'),
);
try {
  validateCurriculum(root);
  process.stdout.write('Curriculum content valid\n');
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Curriculum validation failed'}\n`,
  );
  process.exitCode = 1;
}
