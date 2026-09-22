import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema.ts',
  out: './drizzle',
  schemaFilter: ['codequest'],
  strict: true,
  verbose: true,
  ...(databaseUrl === undefined ? {} : { dbCredentials: { url: databaseUrl } }),
});
