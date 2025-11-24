import { Router } from 'express';
import * as FolderModel from '../models/folder.model';
import { pool } from '../db/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Отримати колоди папки
router.get('/folders/:id/decks', async (req, res) => {
  const result = await pool.query('SELECT * FROM decks WHERE folder_id = $1', [
    req.params.id,
  ]);
  res.json(result.rows);
});

// Додати колоду в папку
router.post('/folders/:id/decks', async (req, res) => {
  const { title, description } = req.body;
  const result = await pool.query(
    'INSERT INTO decks (folder_id, title, description) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, title, description],
  );
  res.status(201).json(result.rows[0]);
});

// Видалити колоду з папки
router.delete('/folders/:folderId/decks/:deckId', async (req, res) => {
  const { deckId } = req.params;
  const result = await pool.query(
    'DELETE FROM decks WHERE id = $1 RETURNING id',
    [deckId],
  );

  if (!result.rows.length) {
    res.status(404).json({ error: 'Deck not found' });
    return;
  }

  res.json({ message: 'Deck deleted' });
});

// Отримати всі папки користувача
router.get('/folders', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: `Error fetching folders: ${error}` });
  }
});

// Отримати одну папку
router.get('/folders/:id', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM folders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId],
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: `Error fetching folder: ${error}` });
  }
});

// Створити папку для поточного користувача
router.post('/folders', async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;
    const folder = await FolderModel.createFolder(
      title,
      description,
      req.userId,
    );
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: `Error creating folder: ${error}` });
  }
});

// Оновити папку
router.put('/folders/:id', async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;

    const checkResult = await pool.query(
      'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId],
    );

    if (!checkResult.rows[0]) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const folder = await FolderModel.updateFolder(
      Number(req.params.id),
      title,
      description,
    );

    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: `Error updating folder: ${error}` });
  }
});

// Видалити папку
router.delete('/folders/:id', async (req: AuthRequest, res) => {
  try {
    const checkResult = await pool.query(
      'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId],
    );

    if (!checkResult.rows[0]) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const success = await FolderModel.deleteFolder(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: `Error deleting folder: ${error}` });
  }
});

export default router;
