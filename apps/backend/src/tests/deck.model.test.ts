import * as DeckModel from '../models/deck.model';
import { pool } from '../db/connection';

jest.mock('../db/connection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('Deck Model Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDecks', () => {
    it('should return all decks ordered by created_at DESC', async () => {
      const mockDecks = [
        {
          id: 1,
          title: 'English Vocabulary',
          description: 'Learn English words',
          folder_id: null,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
        {
          id: 2,
          title: 'Math Formulas',
          description: 'Basic math',
          folder_id: null,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockDecks });

      const result = await DeckModel.getAllDecks();

      expect(result).toEqual(mockDecks);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM decks ORDER BY created_at DESC',
      );
    });

    it('should return empty array when no decks exist', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await DeckModel.getAllDecks();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getDeckById', () => {
    it('should return deck when found', async () => {
      const mockDeck = {
        id: 1,
        title: 'Spanish Basics',
        description: 'Learn Spanish',
        folder_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDeck] });

      const result = await DeckModel.getDeckById(1);

      expect(result).toEqual(mockDeck);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM decks WHERE id = $1',
        [1],
      );
    });

    it('should return null when deck not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await DeckModel.getDeckById(999);

      expect(result).toBeNull();
    });
  });

  describe('createDeck', () => {
    it('should create a deck with title and description', async () => {
      const mockDeck = {
        id: 1,
        title: 'French Vocabulary',
        description: 'Learn French words',
        folder_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDeck] });

      const result = await DeckModel.createDeck(
        'French Vocabulary',
        'Learn French words',
      );

      expect(result).toEqual(mockDeck);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO decks (title, description, folder_id) VALUES ($1, $2, $3) RETURNING *',
        ['French Vocabulary', 'Learn French words', null],
      );
    });

    it('should create a deck with only title', async () => {
      const mockDeck = {
        id: 2,
        title: 'German',
        description: null,
        folder_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDeck] });

      const result = await DeckModel.createDeck('German');

      expect(result).toEqual(mockDeck);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO decks (title, description, folder_id) VALUES ($1, $2, $3) RETURNING *',
        ['German', null, null],
      );
    });

    it('should create a deck with folder_id', async () => {
      const mockDeck = {
        id: 3,
        title: 'Italian',
        description: 'Italian phrases',
        folder_id: 5,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDeck] });

      const result = await DeckModel.createDeck(
        'Italian',
        'Italian phrases',
        5,
      );

      expect(result).toEqual(mockDeck);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO decks (title, description, folder_id) VALUES ($1, $2, $3) RETURNING *',
        ['Italian', 'Italian phrases', 5],
      );
    });
  });

  describe('updateDeck', () => {
    it('should update deck title and description', async () => {
      const mockDeck = {
        id: 1,
        title: 'Updated Title',
        description: 'Updated description',
        folder_id: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDeck] });

      const result = await DeckModel.updateDeck(
        1,
        'Updated Title',
        'Updated description',
      );

      expect(result).toEqual(mockDeck);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE decks SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        ['Updated Title', 'Updated description', 1],
      );
    });

    it('should return null when deck not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await DeckModel.updateDeck(999, 'Non-existent');

      expect(result).toBeNull();
    });

    it('should update with null description', async () => {
      const mockDeck = {
        id: 1,
        title: 'Only Title',
        description: null,
        folder_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDeck] });

      const result = await DeckModel.updateDeck(1, 'Only Title');

      expect(result).toEqual(mockDeck);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE decks SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        ['Only Title', null, 1],
      );
    });
  });

  describe('deleteDeck', () => {
    it('should return true when deck is successfully deleted', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await DeckModel.deleteDeck(1);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM decks WHERE id = $1',
        [1],
      );
    });

    it('should return false when deck not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await DeckModel.deleteDeck(999);

      expect(result).toBe(false);
    });

    it('should return false when rowCount is null', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: null });

      const result = await DeckModel.deleteDeck(1);

      expect(result).toBe(false);
    });
  });
});
