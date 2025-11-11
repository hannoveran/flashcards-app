import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Folder.css';
import { getDecks, createDeck, editDeck, deleteDecks } from '../api/decks';
import FolderIcon from '../components/FolderIcon/FolderIcon.tsx';
import DialogEditDeck from '../components/Dialog/DialogEditDeck.tsx';
import DialogNewDeck from '../components/Dialog/DialogNewDeck.tsx';
import { Link } from 'react-router-dom';

interface Deck {
  id: number;
  title: string;
  description?: string;
}

function Folder() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const data = await getDecks();
    setDecks(data);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDecks(id);
      setDecks((prev) => prev.filter((deck) => deck.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete deck');
    }
  };

  const openNewDeckDialog = () => {
    setIsNewDialogOpen(true);
  };

  const openEditDeckDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsEditDialogOpen(true);
  };

  const closeNewDeckDialog = () => setIsNewDialogOpen(false);
  const closeEditDeckDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedDeck(null);
  };

  return (
    <section>
      <div className="navbar">
        <button className="BackButton" onClick={() => navigate(-1)}>
          ◀ Back
        </button>
        <h3 className="FolderBanner">MY FLASHCARDS</h3>
        <Link to={'/account'}>
          <button className="AccountButton">Account</button>
        </Link>
      </div>

      <main>
        <div className="container">
          <h2>📁 My Decks</h2>

          <div className="buttonContainer">
            <button onClick={openNewDeckDialog}>+ New Deck</button>
          </div>

          <div className="folderContainer">
            {decks.length === 0 ? (
              <p>No decks found</p>
            ) : (
              <div className="deckContainer">
                {decks.map((deck) => (
                  <div key={deck.id} className="deck">
                    <div className="FolderIcon">
                      <FolderIcon size={60} color="#fff" />
                    </div>
                    <h3>{deck.title}</h3>
                    <p>{deck.description || 'No description'}</p>
                    <div className="deckButtons">
                      <button
                        className="editButton"
                        onClick={() => openEditDeckDialog(deck)}
                      >
                        Edit
                      </button>
                      <button className="studyButton">Study</button>
                      <button
                        className="deleteButton"
                        onClick={() => handleDelete(deck.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <DialogNewDeck
        isOpen={isNewDialogOpen}
        onClose={closeNewDeckDialog}
        onSave={async (title, description) => {
          try {
            await createDeck(title, description);
            await loadDecks();
            closeNewDeckDialog();
          } catch (error) {
            console.error(error);
            alert('Failed to create deck');
          }
        }}
      />

      <DialogEditDeck
        isOpen={isEditDialogOpen}
        onClose={closeEditDeckDialog}
        onSave={async (newTitle, newDescription) => {
          if (!selectedDeck) return;
          try {
            await editDeck(selectedDeck.id, newTitle, newDescription);
            await loadDecks();
            closeEditDeckDialog();
          } catch (error) {
            console.error(error);
            alert('Failed to update deck');
          }
        }}
        deck={selectedDeck}
      />
    </section>
  );
}

export default Folder;
