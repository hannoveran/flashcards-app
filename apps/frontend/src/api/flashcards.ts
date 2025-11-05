import axios from 'axios';

export async function getFlashcards() {
  const res = await axios.get('http://localhost:5000/api/flashcards');
  return res.data;
}
