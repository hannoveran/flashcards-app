import { pool } from '../db/connection';

export interface Card {
  id: number;
  deck_id: number;
  term: string;
  definition: string;
  image_url?: string;
}

// Отримати всі картки колоди
export async function getCardsByDeckId(deckId: number): Promise<Card[]> {
  const result = await pool.query(
    'SELECT * FROM cards WHERE deck_id = $1 ORDER BY id',
    [deckId],
  );
  return result.rows;
}

// Створити картку
export async function createCard(
  deckId: number,
  term: string,
  definition: string,
  imageUrl?: string,
): Promise<Card> {
  const result = await pool.query(
    'INSERT INTO cards (deck_id, term, definition, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [deckId, term, definition, imageUrl || null],
  );
  return result.rows[0];
}

// Видалити картку
export async function deleteCard(cardId: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM cards WHERE id = $1', [cardId]);
  return result.rowCount !== null && result.rowCount > 0;
}
