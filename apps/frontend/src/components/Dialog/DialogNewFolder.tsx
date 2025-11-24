import { useRef, useState, useEffect } from 'react';
import './DialogNewFolder.css';

interface DialogNewFolderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => Promise<void>;
}

function DialogNewFolder({ isOpen, onClose, onSave }: DialogNewFolderProps) {
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
    <dialog ref={dialogRef} onClose={onClose} className="new-folder-dialog">
      <h2>Create New Folder</h2>
      <form onSubmit={handleSubmit} className="folder-name-form">
        <label>
          Folder Name:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Folder name"
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

export default DialogNewFolder;
