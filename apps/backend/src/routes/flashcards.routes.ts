import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const dataPath = path.join(__dirname, '../mock-data/flashcards.json');

router.get('/flashcards', (_req, res) => {
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    const flashcards = JSON.parse(data);
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: `Error reading flashcards data${error}` });
  }
});

export default router;
