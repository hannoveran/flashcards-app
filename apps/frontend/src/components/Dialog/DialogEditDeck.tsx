import { useEffect, useRef, useState } from 'react';
import {
  getDeckCards,
  addCardToDeck,
  deleteCardFromDeck,
} from '../../api/decks';
import './DialogEditDeck.css';

interface Card {
  id: number;
  term: string;
  definition: string;
}

interface DialogEditDeckProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  deck?: { id: number; title: string; description?: string } | null;
}

function DialogEditDeck({
  isOpen,
  onClose,
  onSave,
  deck,
}: DialogEditDeckProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (deck) {
      setName(deck.title);
      setDescription(deck.description || '');
      loadCards();
    }
  }, [deck]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const loadCards = async () => {
    if (!deck) return;

    setIsLoading(true);
    try {
      const data = await getDeckCards(deck.id);
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, description);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deck || !newCard.front.trim() || !newCard.back.trim()) return;

    try {
      const addedCard = await addCardToDeck(
        deck.id,
        newCard.front,
        newCard.back,
      );
      setCards([...cards, addedCard]);
      setNewCard({ front: '', back: '' });
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card');
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!deck) return;

    try {
      await deleteCardFromDeck(deck.id, cardId);
      setCards(cards.filter((c) => c.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card');
    }
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} className="edit-deck-dialog">
      <h2>Edit Deck</h2>

      <form onSubmit={handleSubmit} className="deck-name-form">
        <label>
          Deck Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter deck name"
            required
          />
        </label>
        <label>
          Deck Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter deck description"
            required
          />
        </label>
        <button type="submit" className="saveButton">
          Save
        </button>
      </form>

      <form onSubmit={handleAddCard} className="add-card-form">
        <h3>Add New Card</h3>
        <input
          type="text"
          placeholder="Front (Question)"
          value={newCard.front}
          onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Back (Answer)"
          value={newCard.back}
          onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
          required
        />
        <button type="submit" className="addButton">
          + Add Card
        </button>
      </form>

      <div className="cards-list">
        <h3>Cards ({cards.length})</h3>
        {isLoading ? (
          <p>Loading cards...</p>
        ) : cards.length > 0 ? (
          <ul>
            {cards.map((card) => (
              <li key={card.id} className="card-item">
                <div className="card-content">
                  <h4>
                    Q: <strong>{card.term}</strong>
                  </h4>
                  <h4>A: {card.definition}</h4>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="delete-card-btn"
                  type="button"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No cards yet. Add your first card!</p>
        )}
      </div>

      <menu className="dialog-actions">
        <button type="button" onClick={onClose} className="closeButton">
          Close
        </button>
      </menu>
    </dialog>
  );
}

export default DialogEditDeck;
