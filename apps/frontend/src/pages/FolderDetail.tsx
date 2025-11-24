import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Folder.css';
import {
  getFolderDecks,
  addDeckToFolder,
  deleteDeckFromFolder,
} from '../api/folders';
import { editDeck } from '../api/decks';
import FolderIcon from '../components/FolderIcon/FolderIcon.tsx';
import DialogNewDeck from '../components/Dialog/DialogNewDeck.tsx';
import DialogEditDeck from '../components/Dialog/DialogEditDeck.tsx';
import { Link } from 'react-router-dom';

interface Deck {
  id: number;
  title: string;
  description?: string;
  folder_id: number;
}

function FolderDetail() {
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();
  const [folderTitle, setFolderTitle] = useState('');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isNewDeckDialogOpen, setIsNewDeckDialogOpen] = useState(false);
  const [isEditDeckDialogOpen, setIsEditDeckDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    if (folderId) {
      loadDecks();
    }
  }, [folderId]);

  const loadDecks = async () => {
    if (!folderId) return;

    try {
      const data = await getFolderDecks(Number(folderId));
      setDecks(data);

      if (data.length > 0) {
        setFolderTitle(`Folder #${folderId}`);
      }
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  };

  const handleDelete = async (deckId: number) => {
    if (!folderId) return;

    try {
      await deleteDeckFromFolder(Number(folderId), deckId);
      setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete deck');
    }
  };

  const openNewDeckDialog = () => setIsNewDeckDialogOpen(true);
  const closeNewDeckDialog = () => setIsNewDeckDialogOpen(false);

  const openEditDeckDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsEditDeckDialogOpen(true);
  };
  const closeEditDeckDialog = () => {
    setIsEditDeckDialogOpen(false);
    setSelectedDeck(null);
  };

  return (
    <section>
      <div className="navbar">
        <button className="BackButton" onClick={() => navigate('/folders')}>
          ◀ Back to Folders
        </button>
        <h3 className="FolderBanner">MY FLASHCARDS</h3>
        <Link to={'/account'}>
          <button className="AccountButton">Account</button>
        </Link>
      </div>

      <main>
        <div className="container">
          <h2>📁 {folderTitle || 'My Decks'}</h2>

          <div className="buttonContainer">
            <button onClick={openNewDeckDialog} className="addNewDeck">
              + New Deck
            </button>
          </div>

          <div className="folderContainer">
            {decks.length === 0 ? (
              <p>No decks in this folder. Create your first deck!</p>
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
                      <Link to={`/study/${deck.id}`}>
                        <button className="studyButton">Study</button>
                      </Link>
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

      {/* Діалог створення нової колоди */}
      <DialogNewDeck
        isOpen={isNewDeckDialogOpen}
        onClose={closeNewDeckDialog}
        onSave={async (title, description) => {
          if (!folderId) return;

          try {
            await addDeckToFolder(Number(folderId), title, description);
            await loadDecks();
            closeNewDeckDialog();
          } catch (error) {
            console.error(error);
            alert('Failed to create deck');
          }
        }}
      />

      {/* Діалог редагування колоди */}
      <DialogEditDeck
        isOpen={isEditDeckDialogOpen}
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

export default FolderDetail;
