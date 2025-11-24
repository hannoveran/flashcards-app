import { pool } from '../db/connection';

export interface Folder {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Отримати всі папки
export async function getAllFolders(): Promise<Folder[]> {
  const result = await pool.query(
    'SELECT * FROM folders ORDER BY created_at DESC',
  );
  return result.rows;
}

// Отримати папку за ID
export async function getFolderById(id: number): Promise<Folder | null> {
  const result = await pool.query('SELECT * FROM folders WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Створити папку
export async function createFolder(
  title: string,
  description?: string,
  userId?: number,
): Promise<Folder> {
  const result = await pool.query(
    'INSERT INTO folders (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
    [title, description || null, userId || null],
  );
  return result.rows[0];
}

// Оновити папку
export async function updateFolder(
  id: number,
  title: string,
  description?: string,
): Promise<Folder | null> {
  const result = await pool.query(
    'UPDATE folders SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [title, description || null, id],
  );
  return result.rows[0] || null;
}

// Видалити папку
export async function deleteFolder(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM folders WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
