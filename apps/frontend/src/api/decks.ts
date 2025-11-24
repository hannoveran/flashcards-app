import { apiClient } from './client';

export async function getDecks() {
  const res = await apiClient.get('/decks');
  return res.data;
}

export async function createDeck(title: string, description?: string) {
  const res = await apiClient.post('/decks', {
    title,
    description: description || '',
  });
  return res.data;
}

export async function editDeck(
  id: number,
  title: string,
  description?: string,
) {
  const res = await apiClient.put(`/decks/${id}`, {
    title,
    description: description || '',
  });
  return res.data;
}

export async function deleteDecks(id: number) {
  const res = await apiClient.delete(`/decks/${id}`);
  return res.data;
}

export async function getDeckCards(deckId: number) {
  const res = await apiClient.get(`/decks/${deckId}/cards`);
  return res.data;
}

export async function addCardToDeck(
  deckId: number,
  front: string,
  back: string,
) {
  const res = await apiClient.post(`/decks/${deckId}/cards`, {
    term: front,
    definition: back,
  });
  return res.data;
}

export async function deleteCardFromDeck(deckId: number, cardId: number) {
  const res = await apiClient.delete(`/decks/${deckId}/cards/${cardId}`);
  return res.data;
}
