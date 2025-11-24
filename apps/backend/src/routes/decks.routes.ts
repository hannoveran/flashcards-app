import { Router } from 'express';
import * as DeckModel from '../models/deck.model';
import * as CardModel from '../models/card.model';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Отримати всі колоди користувача
router.get('/decks', async (_req: AuthRequest, res) => {
  try {
    const result = await DeckModel.getAllDecks();
    res.json(result);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ error: `Error fetching decks: ${error}` });
  }
});

// Отримати одну колоду
router.get('/decks/:id', async (req, res) => {
  try {
    const deck = await DeckModel.getDeckById(Number(req.params.id));
    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }
    res.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ error: `Error fetching deck: ${error}` });
  }
});

// Створити колоду
router.post('/decks', async (req, res) => {
  try {
    const { title, description, folder_id } = req.body;
    const deck = await DeckModel.createDeck(title, description, folder_id);
    res.status(201).json(deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ error: `Error creating deck: ${error}` });
  }
});

// Оновити колоду
router.put('/decks/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const deck = await DeckModel.updateDeck(
      Number(req.params.id),
      title,
      description,
    );
    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }
    res.json(deck);
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).json({ error: `Error updating deck: ${error}` });
  }
});

// Видалити колоду
router.delete('/decks/:id', async (req, res) => {
  try {
    const success = await DeckModel.deleteDeck(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }
    res.json({ message: 'Deck deleted' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ error: `Error deleting deck: ${error}` });
  }
});

// Отримати картки колоди
router.get('/decks/:deckId/cards', async (req, res) => {
  try {
    const cards = await CardModel.getCardsByDeckId(Number(req.params.deckId));
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: `Error fetching cards: ${error}` });
  }
});

// Додати картку
router.post('/decks/:deckId/cards', async (req, res) => {
  try {
    const { term, definition, image_url } = req.body;
    const card = await CardModel.createCard(
      Number(req.params.deckId),
      term,
      definition,
      image_url,
    );
    res.status(201).json(card);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: `Error adding card: ${error}` });
  }
});

// Видалити картку
router.delete('/decks/:deckId/cards/:cardId', async (req, res) => {
  try {
    const success = await CardModel.deleteCard(Number(req.params.cardId));
    if (!success) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: `Error deleting card: ${error}` });
  }
});

export default router;
