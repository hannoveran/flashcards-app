import { pool } from './src/db/connection';

async function testConnection() {
  try {
    console.log(' Testing database connection...');

    const client = await pool.connect();
    console.log(' Successfully connected to database');

    const result = await client.query('SELECT version()');
    console.log(' PostgreSQL version:', result.rows[0].version.split(' ')[1]);

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n Available tables:');
    tables.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    const users = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n Users in database: ${users.rows[0].count}`);

    client.release();
    await pool.end();

    console.log('\n All checks passed!');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
