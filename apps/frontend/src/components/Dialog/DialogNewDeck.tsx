import { useRef, useState, useEffect } from 'react';
import './DialogNewDeck.css';

interface DialogNewDeckProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => Promise<void>;
}

function DialogNewDeck({ isOpen, onClose, onSave }: DialogNewDeckProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} className="new-deck-dialog">
      <h2>Create New Deck</h2>
      <form onSubmit={handleSubmit} className="deck-name-form">
        <label>
          Deck Name:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter deck name"
            required
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </label>

        <menu className="dialog-actions">
          <button type="submit" className="saveButton">
            Save
          </button>
          <button type="button" onClick={onClose} className="closeButton">
            Cancel
          </button>
        </menu>
      </form>
    </dialog>
  );
}

export default DialogNewDeck;
