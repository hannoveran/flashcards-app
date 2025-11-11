export interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export interface Deck {
  id: number;
  title: string;
  description: string;
  cards: Flashcard[];
}
