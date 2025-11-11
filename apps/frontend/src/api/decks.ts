import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export async function getDecks() {
  const res = await axios.get(`${API_URL}/decks`);
  return res.data;
}

export async function createDeck(title: string, description?: string) {
  const res = await axios.post(`${API_URL}/decks`, {
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
  const res = await axios.put(`${API_URL}/decks/${id}`, {
    title,
    description,
  });
  return res.data;
}

export async function deleteDecks(id: number) {
  const res = await axios.delete(`${API_URL}/decks/${id}`);
  return res.data;
}

export async function getDeckCards(deckId: number) {
  const res = await axios.get(`${API_URL}/decks/${deckId}/cards`);
  return res.data;
}

export async function addCardToDeck(
  deckId: number,
  front: string,
  back: string,
) {
  const res = await axios.post(`${API_URL}/decks/${deckId}/cards`, {
    term: front,
    definition: back,
  });
  return res.data;
}

export async function deleteCardFromDeck(deckId: number, cardId: number) {
  const res = await axios.delete(`${API_URL}/decks/${deckId}/cards/${cardId}`);
  return res.data;
}
