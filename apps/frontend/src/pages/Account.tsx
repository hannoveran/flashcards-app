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
          <div className="profileContainer">
            <h3> 👤 Profile</h3>
            <div className="profilePicture"></div>
            <h2 className="nick"></h2>
            <p className="email"></p>
            <div>
              <p>MEMBER SINCE</p>
              <p className="date"></p>
            </div>
          </div>

          <div className="achievementsContainer">
            <h3> 🏆 Achievements</h3>
            <div className="firstDeck">
              <h4>First Deck</h4>
              <p></p>
            </div>
            <div className="studyStreak">
              <h4>Study Streak</h4>
              <p></p>
            </div>
            <div className="cardMaster">
              <h4>Card Master</h4>
              <p></p>
            </div>
          </div>
        </div>
        <div className="rightContainer">
          <div className="statisticsContainer">
            <h3> 📊 Statistics</h3>
            <div className="decks">
              <p></p>
              <h4>Decks</h4>
            </div>
            <div className="cards">
              <p></p>
              <h4>Cards</h4>
            </div>
            <div className="sessions">
              <p></p>
              <h4>Sessions</h4>
            </div>
            <div className="time">
              <p></p>
              <h4>Time</h4>
            </div>
          </div>

          <div className="profileSettingsContainer">
            <h3> ⚙️ Profile Settings</h3>
            <form>
              <label>Username</label>
              <input type="text" />

              <label>Email</label>
              <input type="text" />

              <button>💾 Save Changes</button>
            </form>
          </div>

          <div className="appPreferencesContainer">
            <h3> 🎮 App Preferences</h3>
            <div className="soundEffects">
              <h4>Sound Effects</h4>
              <p>Play retro sounds</p>
              <input type="checkbox" />
            </div>
            <hr />
            <button>🗑️ Delete Account</button>
          </div>
        </div>
      </main>
    </section>
  );
}

export default Account;
