import { apiClient } from './client';

export async function getFolders() {
  const res = await apiClient.get('/folders');
  return res.data;
}

export async function createFolder(title: string, description?: string) {
  const res = await apiClient.post('/folders', {
    title,
    description: description || '',
  });
  return res.data;
}

export async function editFolder(
  id: number,
  title: string,
  description?: string,
) {
  const res = await apiClient.put(`/folders/${id}`, {
    title,
    description,
  });
  return res.data;
}

export async function deleteFolders(id: number) {
  const res = await apiClient.delete(`/folders/${id}`);
  return res.data;
}

export async function getFolderDecks(folderId: number) {
  const res = await apiClient.get(`/folders/${folderId}/decks`);
  return res.data;
}

export async function addDeckToFolder(
  folderId: number,
  title: string,
  description: string,
) {
  const res = await apiClient.post(`/folders/${folderId}/decks`, {
    title,
    description,
  });
  return res.data;
}

export async function deleteDeckFromFolder(folderId: number, deckId: number) {
  const res = await apiClient.delete(`/folders/${folderId}/decks/${deckId}`);
  return res.data;
}
