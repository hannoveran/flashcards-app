import { pool } from '../db/connection';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at?: Date;
}

// Створити користувача
export async function createUser(
  username: string,
  email: string,
  password: string,
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [username, email, hashedPassword],
  );

  return result.rows[0];
}

// Знайти за email
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return result.rows[0] || null;
}

// Знайти за ID
export async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] || null;
}

// Перевірити пароль
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Оновити профіль
export async function updateUser(
  id: number,
  username?: string,
  email?: string,
): Promise<User | null> {
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (username) {
    updates.push(`username = $${paramIndex++}`);
    values.push(username);
  }
  if (email) {
    updates.push(`email = $${paramIndex++}`);
    values.push(email);
  }

  if (updates.length === 0) return null;

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, created_at`,
    values,
  );

  return result.rows[0] || null;
}
