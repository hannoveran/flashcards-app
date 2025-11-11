import '../styles/Account.css';
import { useNavigate } from 'react-router-dom';

function Account() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="accountNavbar">
        <button className="BackButton" onClick={() => navigate(-1)}>
          ◀ Back
        </button>
        <h3 className="FolderBanner">ACCOUNT SETTINGS</h3>
      </div>

      <main className="accountMain">
        <div className="leftContainer">
          <div className="profileContainer"></div>
          <div className="achievementsContainer"></div>
        </div>
        <div className="rightContainer">
          <div className="statisticsContainer"></div>
          <div className="profileSettingsContainer"></div>
          <div className="appPreferencesContainer"></div>
        </div>
      </main>
    </section>
  );
}

export default Account;
