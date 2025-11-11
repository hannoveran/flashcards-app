import './Header.css';
import FolderIcon from '../FolderIcon/FolderIcon.tsx';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <section>
      <div className="navbar">
        <div className="FolderIconLogo">
          <FolderIcon size={36} color="#fff" />
        </div>
        <input type="text" />
        <Link to={'/account'}>
          <button className="AccountButton">Account</button>
        </Link>
      </div>
    </section>
  );
}

export default Header;
