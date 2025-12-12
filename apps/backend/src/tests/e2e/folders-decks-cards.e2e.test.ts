import { test, expect } from '@playwright/test';
import {
  DatabaseHelpers,
  AuthHelpers,
  TestDataGenerator,
} from './helpers/test-helpers';

/**
 * E2E Tests для Folders → Decks → Cards
 */

test.describe('Folders → Decks → Cards E2E Tests', () => {
  let userEmail: string;
  let userPassword: string;

  test.beforeEach(async ({ page }) => {
    await DatabaseHelpers.cleanDatabase();

    userEmail = TestDataGenerator.generateEmail();
    userPassword = TestDataGenerator.defaultPassword();

    await DatabaseHelpers.createTestUser(
      TestDataGenerator.generateUsername(),
      userEmail,
      userPassword,
    );

    await AuthHelpers.loginViaUI(page, userEmail, userPassword);
  });

  test.afterAll(async () => {
    await DatabaseHelpers.closeConnection();
  });

  test('користувач може створити папку', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');

    const folderTitle = 'Biology';
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill(folderTitle);
    await page.locator('dialog[open] button.saveButton').click();

    await expect(page.locator(`h2:has-text("${folderTitle}")`)).toBeVisible();
  });

  test('користувач може створити колоду в папці', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill('Science');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('button.addNewDeck');
    await page.waitForSelector('dialog[open]', { state: 'visible' });

    const deckTitle = 'Cell Biology';
    await page
      .locator('dialog[open] input[placeholder="Enter deck name"]')
      .fill(deckTitle);
    await page.locator('dialog[open] button.saveButton').click();

    await expect(
      page.locator(`.deck h3:has-text("${deckTitle}")`),
    ).toBeVisible();
  });

  test('користувач може додати картку до колоди', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill('Vocab');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('button.addNewDeck');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder="Enter deck name"]')
      .fill('Words');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('.deck button.editButton');
    await page.waitForSelector('dialog[open]', { state: 'visible' });

    await page.fill('input[placeholder*="Front"]', 'Hello');
    await page.fill('input[placeholder*="Back"]', 'Привіт');
    await page.click('button.addButton');

    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('h3:has-text("Cards (1)")')).toBeVisible();
  });

  test('може додати 3 картки', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill('Terms');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('button.addNewDeck');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder="Enter deck name"]')
      .fill('Bio');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('.deck button.editButton');
    await page.waitForSelector('dialog[open]', { state: 'visible' });

    const cards = [
      { term: 'Cell', definition: 'Basic unit' },
      { term: 'DNA', definition: 'Genetic material' },
      { term: 'Protein', definition: 'Molecule' },
    ];

    for (const card of cards) {
      await page.fill('input[placeholder*="Front"]', card.term);
      await page.fill('input[placeholder*="Back"]', card.definition);
      await page.click('button.addButton');
      await page.waitForTimeout(300);
    }

    await expect(page.locator('h3:has-text("Cards (3)")')).toBeVisible();
  });

  test('повний флоу: папка → колода → 3 картки', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill('Complete Test');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('button.addNewDeck');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder="Enter deck name"]')
      .fill('Full Deck');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('.deck button.editButton');
    await page.waitForSelector('dialog[open]', { state: 'visible' });

    for (let i = 1; i <= 3; i++) {
      await page.fill('input[placeholder*="Front"]', `Card ${i}`);
      await page.fill('input[placeholder*="Back"]', `Def ${i}`);
      await page.click('button.addButton');
      await page.waitForTimeout(300);
    }

    await expect(page.locator('h3:has-text("Cards (3)")')).toBeVisible();
    await page.locator('dialog[open] button.closeButton').click();

    await expect(page.locator('.deck h3:has-text("Full Deck")')).toBeVisible();
  });

  test('може видалити колоду', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill('Test');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('button.addNewDeck');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder="Enter deck name"]')
      .fill('To Delete');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('.deck button.deleteButton');

    await expect(
      page.locator('.deck h3:has-text("To Delete")'),
    ).not.toBeVisible();
  });

  test('дані зберігаються після reload', async ({ page }) => {
    await page.goto('/folder');

    await page.click('button.addNewFolder');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder*="Folder name"]')
      .fill('Persist');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.click('button.addNewDeck');
    await page.waitForSelector('dialog[open]', { state: 'visible' });
    await page
      .locator('dialog[open] input[placeholder="Enter deck name"]')
      .fill('Saved Deck');
    await page.locator('dialog[open] button.saveButton').click();
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h2:has-text("Persist")')).toBeVisible();
    await expect(page.locator('.deck h3:has-text("Saved Deck")')).toBeVisible();
  });
});
