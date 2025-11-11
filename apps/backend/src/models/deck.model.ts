import { pool } from '../db/connection';

export interface Deck {
  id: number;
  folder_id?: number;
  title: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Отримати всі колоди
export async function getAllDecks(): Promise<Deck[]> {
  const result = await pool.query(
    'SELECT * FROM decks ORDER BY created_at DESC',
  );
  return result.rows;
}

// Отримати колоду за ID
export async function getDeckById(id: number): Promise<Deck | null> {
  const result = await pool.query('SELECT * FROM decks WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Створити колоду
export async function createDeck(
  title: string,
  description?: string,
  folderId?: number,
): Promise<Deck> {
  const result = await pool.query(
    'INSERT INTO decks (title, description, folder_id) VALUES ($1, $2, $3) RETURNING *',
    [title, description || null, folderId || null],
  );
  return result.rows[0];
}

// Оновити колоду
export async function updateDeck(
  id: number,
  title: string,
  description?: string,
): Promise<Deck | null> {
  const result = await pool.query(
    'UPDATE decks SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [title, description || null, id],
  );
  return result.rows[0] || null;
}

// Видалити колоду
export async function deleteDeck(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM decks WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}
