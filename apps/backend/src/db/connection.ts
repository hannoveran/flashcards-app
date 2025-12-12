import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const isTest = process.env.NODE_ENV === 'test';
const envPath = isTest
  ? path.resolve(__dirname, '../../.env.test')
  : path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

let connectionString: string;

if (process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
} else {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME;

  if (!user || !password || !database) {
    throw new Error(
      `Missing database configuration. Required: DB_USER, DB_PASSWORD, DB_NAME. ` +
        `Got: user=${user}, password=${!!password}, database=${database}`,
    );
  }

  connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

console.log(
  `Connecting to database: ${connectionString.replace(/:[^:@]+@/, ':****@')}`,
);

export const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
