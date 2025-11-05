import { useEffect, useState } from 'react';
import '../styles/Folder.css';
import { getFlashcards } from '../api/flashcards';

interface Flashcard {
  id: number;
  term: string;
  definition: string;
  deck?: string;
}

function Folder() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    getFlashcards().then((data) => {
      setFlashcards(data);
    });
  }, []);

  return (
    <section>
      <div className="navbar">
        <button>◀ Back</button>
        <h3 className="FolderBanner">MY FLASHCARDS</h3>
        <button>Account</button>
      </div>

      <main>
        <div>
          <h2>Your Flashcard Decks</h2>

          {flashcards.length === 0 ? (
            <p>No flashcards found</p>
          ) : (
            <ul>
              {flashcards.map((card) => (
                <li key={card.id}>
                  <strong>{card.term}</strong>: {card.definition}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </section>
  );
}

export default Folder;
