import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { join } from 'node:path';
import { Client } from 'pg';

// 1. Try loading from providers/supabase/.env (relative to this file)
const localEnv = join(import.meta.dirname, '.env');
if (existsSync(localEnv)) {
  loadEnvFile(localEnv);
}

// 2. Try loading from root .env (relative to current working directory)
if (existsSync('.env')) {
  loadEnvFile();
}

const optionalEnv = (name: string) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
};

const requiredEnv = (name: string) => {
  const value = optionalEnv(name);

  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  }

  return value;
};

const getClient = () => {
  const connectionString = optionalEnv('SUPABASE_DB_POOLER_URL');
  const ssl = process.env.SUPABASE_DB_SSL === 'false'
    ? false
    : { rejectUnauthorized: false };

  if (connectionString) {
    return new Client({ connectionString, ssl });
  }

  const projectRef = requiredEnv('SUPABASE_PROJECT_REF');

  return new Client({
    host: requiredEnv('SUPABASE_DB_POOLER_HOST'),
    port: Number(optionalEnv('SUPABASE_DB_POOLER_PORT') ?? 5432),
    database: optionalEnv('SUPABASE_DB_NAME') ?? 'postgres',
    user: optionalEnv('SUPABASE_DB_POOLER_USER') ?? `postgres.${projectRef}`,
    password: requiredEnv('SUPABASE_DB_PASSWORD'),
    ssl,
  });
};

async function main() {
  const client = getClient();

  try {
    console.log('Checking Supabase shared pooler health...');
    await client.connect();

    const result = await client.query(`
      select
        current_database() as database,
        current_user as user_name,
        now() as checked_at,
        version() as version
    `);

    console.log('Health check OK.');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Health check failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
