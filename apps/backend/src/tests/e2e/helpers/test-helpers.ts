import { Page } from '@playwright/test';
import { pool } from '../../../db/connection';

/**
 * Helpers для роботи з базою даних в E2E тестах
 */
export class DatabaseHelpers {
  static async cleanDatabase(): Promise<void> {
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE folders RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE decks RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE cards RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE progress RESTART IDENTITY CASCADE');
  }

  static async createTestUser(
    username = 'testuser',
    email = 'test@example.com',
    password = 'password123',
  ) {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword],
    );

    return result.rows[0];
  }

  static async userExists(email: string): Promise<boolean> {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows.length > 0;
  }

  static async getUserCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }

  static async closeConnection(): Promise<void> {
    await pool.end();
  }
}

export class AuthHelpers {
  static async loginViaUI(
    page: Page,
    email: string,
    password: string,
  ): Promise<void> {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/folder', { timeout: 5000 });
  }

  static async registerViaUI(
    page: Page,
    username: string,
    email: string,
    password: string,
  ): Promise<void> {
    await page.goto('/register');
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="email"]', email);

    const passwordFields = await page.locator('input[type="password"]').all();
    await passwordFields[0].fill(password);
    await passwordFields[1].fill(password);

    await page.click('button[type="submit"]');
    await page.waitForURL('/folder', { timeout: 5000 });
  }

  static async getToken(page: Page): Promise<string | null> {
    return await page.evaluate(() => localStorage.getItem('token'));
  }

  static async isAuthenticated(page: Page): Promise<boolean> {
    const token = await this.getToken(page);
    return token !== null;
  }

  static async logout(page: Page): Promise<void> {
    await page.evaluate(() => localStorage.removeItem('token'));
  }
}

export class TestDataGenerator {
  private static counter = 0;

  static generateEmail(): string {
    this.counter++;
    return `test${this.counter}_${Date.now()}@example.com`;
  }

  static generateUsername(): string {
    this.counter++;
    return `testuser${this.counter}_${Date.now()}`;
  }

  static generatePassword(): string {
    return `TestPass${Math.random().toString(36).substring(7)}!`;
  }

  static defaultPassword(): string {
    return 'Test123456!';
  }
}

export class ContentHelpers {
  static async createFolderViaAPI(
    token: string,
    title: string,
    description?: string,
  ) {
    const response = await fetch('http://localhost:5000/api/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    return response.json();
  }

  static async createDeckViaAPI(
    token: string,
    folderId: number,
    title: string,
    description?: string,
  ) {
    const response = await fetch(
      `http://localhost:5000/api/folders/${folderId}/decks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      },
    );
    return response.json();
  }

  static async addCardViaAPI(
    token: string,
    deckId: number,
    term: string,
    definition: string,
  ) {
    const response = await fetch(
      `http://localhost:5000/api/decks/${deckId}/cards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ term, definition }),
      },
    );
    return response.json();
  }

  static async createCompleteStructure(
    token: string,
    folderTitle: string,
    deckTitle: string,
    cards: Array<{ term: string; definition: string }>,
  ) {
    const folder = await this.createFolderViaAPI(token, folderTitle);
    const deck = await this.createDeckViaAPI(token, folder.id, deckTitle);

    for (const card of cards) {
      await this.addCardViaAPI(token, deck.id, card.term, card.definition);
    }

    return { folder, deck };
  }

  static async getAllFolders() {
    const result = await pool.query('SELECT * FROM folders ORDER BY id');
    return result.rows;
  }

  static async getAllDecks() {
    const result = await pool.query('SELECT * FROM decks ORDER BY id');
    return result.rows;
  }

  static async getAllCards() {
    const result = await pool.query('SELECT * FROM cards ORDER BY id');
    return result.rows;
  }

  static async getCardCount(deckId: number): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM cards WHERE deck_id = $1',
      [deckId],
    );
    return parseInt(result.rows[0].count);
  }
}
