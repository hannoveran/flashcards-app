import './Header.css';
import FolderIcon from '../FolderIcon/FolderIcon.tsx';

function Header() {
  return (
    <section>
      <div className="navbar">
        <div className="FolderIconLogo">
          <FolderIcon size={36} color="#fff" />
        </div>
        <input type="text" />
        <button>Account</button>
      </div>
    </section>
  );
}

export default Header;
