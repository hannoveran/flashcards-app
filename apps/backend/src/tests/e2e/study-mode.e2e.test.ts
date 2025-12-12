import { test, expect } from '@playwright/test';
import {
  DatabaseHelpers,
  AuthHelpers,
  TestDataGenerator,
} from './helpers/test-helpers';
import { pool } from '../../db/connection';

/**
 * E2E Tests для Study Mode
 */

test.describe('Study Mode E2E Tests', () => {
  let userEmail: string;
  let userPassword: string;
  let deckId: number;

  test.beforeEach(async ({ page }) => {
    await DatabaseHelpers.cleanDatabase();

    userEmail = TestDataGenerator.generateEmail();
    userPassword = TestDataGenerator.defaultPassword();

    const user = await DatabaseHelpers.createTestUser(
      TestDataGenerator.generateUsername(),
      userEmail,
      userPassword,
    );

    const folderResult = await pool.query(
      'INSERT INTO folders (user_id, title) VALUES ($1, $2) RETURNING id',
      [user.id, 'Test Folder'],
    );

    const deckResult = await pool.query(
      'INSERT INTO decks (folder_id, title) VALUES ($1, $2) RETURNING id',
      [folderResult.rows[0].id, 'Study Deck'],
    );

    deckId = deckResult.rows[0].id;

    const cards = [
      { term: 'HTML', definition: 'HyperText Markup Language' },
      { term: 'CSS', definition: 'Cascading Style Sheets' },
      { term: 'JS', definition: 'JavaScript' },
    ];

    for (const card of cards) {
      await pool.query(
        'INSERT INTO cards (deck_id, term, definition) VALUES ($1, $2, $3)',
        [deckId, card.term, card.definition],
      );
    }

    await AuthHelpers.loginViaUI(page, userEmail, userPassword);
  });

  test.afterAll(async () => {
    await DatabaseHelpers.closeConnection();
  });

  test('користувач може відкрити режим вивчення', async ({ page }) => {
    await page.goto('/folder');

    await page.click('.deck button.studyButton');

    await expect(page).toHaveURL(`/study/${deckId}`);
    await expect(page.locator('button.exitStudyButton')).toBeVisible();

    await expect(
      page.locator('.studyPageNavbar span:has-text("1 / 3")'),
    ).toBeVisible();
  });

  test('може перевернути картку (flip)', async ({ page }) => {
    await page.goto(`/study/${deckId}`);

    await expect(
      page.locator('.cardLabel:has-text("QUESTION:")'),
    ).toBeVisible();
    await expect(page.locator('.cardText:has-text("HTML")')).toBeVisible();

    await page.click('.greenScreen');

    await expect(page.locator('.cardLabel:has-text("ANSWER:")')).toBeVisible();
    await expect(
      page.locator('.cardText:has-text("HyperText Markup Language")'),
    ).toBeVisible();
  });

  test('навігаціяNext/Previous працює', async ({ page }) => {
    await page.goto(`/study/${deckId}`);

    await expect(page.locator('.cardText:has-text("HTML")')).toBeVisible();
    await expect(
      page.locator('.studyPageNavbar span:has-text("1 / 3")'),
    ).toBeVisible();

    await page.click('button.nextButton');
    await expect(page.locator('.cardText:has-text("CSS")')).toBeVisible();
    await expect(
      page.locator('.studyPageNavbar span:has-text("2 / 3")'),
    ).toBeVisible();

    await page.click('button.previousButton');
    await expect(page.locator('.cardText:has-text("HTML")')).toBeVisible();
  });

  test('прогрес-бар оновлюється', async ({ page }) => {
    await page.goto(`/study/${deckId}`);

    await expect(
      page.locator('.restartContainer span:has-text("PROGRESS: 1 / 3")'),
    ).toBeVisible();

    await page.click('button.nextButton');
    await expect(
      page.locator('.restartContainer span:has-text("PROGRESS: 2 / 3")'),
    ).toBeVisible();

    await page.click('button.nextButton');
    await expect(
      page.locator('.restartContainer span:has-text("PROGRESS: 3 / 3")'),
    ).toBeVisible();
  });

  test('показує екран завершення після останньої картки', async ({ page }) => {
    await page.goto(`/study/${deckId}`);

    await page.click('button.nextButton');
    await page.click('button.nextButton');
    await page.click('button.nextButton');

    await expect(
      page.locator('.completionTitle:has-text("★ DECK COMPLETE! ★")'),
    ).toBeVisible();
    await expect(page.locator('button.restartButton')).toBeVisible();
    await expect(page.locator('button.exitButton')).toBeVisible();
  });

  test('Restart повертає до першої картки', async ({ page }) => {
    await page.goto(`/study/${deckId}`);

    await page.click('button.nextButton');
    await expect(page.locator('.cardText:has-text("CSS")')).toBeVisible();

    await page.locator('.restartContainer button:has-text("Restart")').click();

    await expect(page.locator('.cardText:has-text("HTML")')).toBeVisible();
    await expect(
      page.locator('.studyPageNavbar span:has-text("1 / 3")'),
    ).toBeVisible();
  });

  test('повний цикл вивчення: flip + навігація + complete', async ({
    page,
  }) => {
    await page.goto(`/study/${deckId}`);

    await expect(page.locator('.cardText:has-text("HTML")')).toBeVisible();
    await page.click('.greenScreen');
    await expect(
      page.locator('.cardText:has-text("HyperText Markup Language")'),
    ).toBeVisible();
    await page.click('button.nextButton');

    await expect(page.locator('.cardText:has-text("CSS")')).toBeVisible();
    await page.click('button.flipButton');
    await expect(
      page.locator('.cardText:has-text("Cascading Style Sheets")'),
    ).toBeVisible();
    await page.click('button.nextButton');

    await expect(page.locator('.cardText:has-text("JS")')).toBeVisible();
    await page.click('.greenScreen');
    await expect(
      page.locator('.cardText:has-text("JavaScript")'),
    ).toBeVisible();
    await page.click('button.nextButton');

    await expect(
      page.locator('.completionTitle:has-text("★ DECK COMPLETE! ★")'),
    ).toBeVisible();

    await page.click('button.restartButton');
    await expect(page.locator('.cardText:has-text("HTML")')).toBeVisible();
    await expect(
      page.locator('.studyPageNavbar span:has-text("1 / 3")'),
    ).toBeVisible();
  });
});
