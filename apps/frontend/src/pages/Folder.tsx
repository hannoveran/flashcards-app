import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Folder.css';
import {
  getFolders,
  createFolder,
  deleteFolders,
  getFolderDecks,
  addDeckToFolder,
  deleteDeckFromFolder,
} from '../api/folders';
import { editDeck } from '../api/decks';
import FolderIcon from '../components/FolderIcon/FolderIcon.tsx';
import DialogNewFolder from '../components/Dialog/DialogNewFolder.tsx';
import DialogNewDeck from '../components/Dialog/DialogNewDeck.tsx';
import DialogEditDeck from '../components/Dialog/DialogEditDeck.tsx';

interface Folder {
  id: number;
  title: string;
  description?: string;
}

interface Deck {
  id: number;
  title: string;
  description?: string;
  folder_id: number;
}

function Folder() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderDecks, setFolderDecks] = useState<{
    [folderId: number]: Deck[];
  }>({});

  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isNewDeckDialogOpen, setIsNewDeckDialogOpen] = useState(false);
  const [isEditDeckDialogOpen, setIsEditDeckDialogOpen] = useState(false);

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const data = await getFolders();
    setFolders(data);

    // Завантажити колоди для кожної папки
    for (const folder of data) {
      loadFolderDecks(folder.id);
    }
  };

  const loadFolderDecks = async (folderId: number) => {
    try {
      const decks = await getFolderDecks(folderId);
      setFolderDecks((prev) => ({ ...prev, [folderId]: decks }));
    } catch (error) {
      console.error(`Failed to load decks for folder ${folderId}:`, error);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      await deleteFolders(id);
      setFolders((prev) => prev.filter((folder) => folder.id !== id));
      setFolderDecks((prev) => {
        const newDecks = { ...prev };
        delete newDecks[id];
        return newDecks;
      });
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete Folder');
    }
  };

  const handleDeleteDeck = async (folderId: number, deckId: number) => {
    try {
      await deleteDeckFromFolder(folderId, deckId);
      setFolderDecks((prev) => ({
        ...prev,
        [folderId]: prev[folderId].filter((deck) => deck.id !== deckId),
      }));
    } catch (error) {
      console.error('Failed to delete deck:', error);
      alert('Failed to delete deck');
    }
  };

  const openNewFolderDialog = () => setIsNewFolderDialogOpen(true);
  const closeNewFolderDialog = () => setIsNewFolderDialogOpen(false);

  const openNewDeckDialog = (folderId: number) => {
    setSelectedFolderId(folderId);
    setIsNewDeckDialogOpen(true);
  };
  const closeNewDeckDialog = () => {
    setIsNewDeckDialogOpen(false);
    setSelectedFolderId(null);
  };

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
        <button className="BackButton" onClick={() => navigate(-1)}>
          ◀ Back
        </button>
        <h3 className="FolderBanner">MY FLASHCARDS</h3>
        <Link to={'/account'}>
          <button className="AccountButton">Account</button>
        </Link>
      </div>

      <main>
        <div className="buttonContainer" style={{ marginBottom: '2rem' }}>
          <button onClick={openNewFolderDialog} className="addNewFolder">
            + New Folder
          </button>
        </div>

        {/* Список папок з колодами всередині */}
        {folders.length === 0 ? (
          <p>No folders found. Create your first folder!</p>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="container"
              style={{ marginBottom: '3rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2>📁 {folder.title}</h2>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  Delete Folder
                </button>
              </div>

              {folder.description && <p>{folder.description}</p>}

              {/* Кнопка додавання колоди в цю папку */}
              <div className="buttonContainer">
                <button
                  onClick={() => openNewDeckDialog(folder.id)}
                  className="addNewDeck"
                >
                  + New Deck
                </button>
              </div>

              {/* Колоди всередині цієї папки */}
              <div className="folderContainer">
                {!folderDecks[folder.id] ||
                folderDecks[folder.id].length === 0 ? (
                  <p>No decks in this folder yet.</p>
                ) : (
                  <div className="deckContainer">
                    {folderDecks[folder.id].map((deck) => (
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
                            onClick={() => handleDeleteDeck(folder.id, deck.id)}
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
          ))
        )}
      </main>

      {/* Діалог створення нової папки */}
      <DialogNewFolder
        isOpen={isNewFolderDialogOpen}
        onClose={closeNewFolderDialog}
        onSave={async (title, description) => {
          try {
            await createFolder(title, description);
            await loadFolders();
            closeNewFolderDialog();
          } catch (error) {
            console.error(error);
            alert('Failed to create folder');
          }
        }}
      />

      {/* Діалог створення нової колоди */}
      <DialogNewDeck
        isOpen={isNewDeckDialogOpen}
        onClose={closeNewDeckDialog}
        onSave={async (title, description) => {
          if (!selectedFolderId) return;

          try {
            await addDeckToFolder(selectedFolderId, title, description);
            await loadFolderDecks(selectedFolderId);
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
            await loadFolderDecks(selectedDeck.folder_id);
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
