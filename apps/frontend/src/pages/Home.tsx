import { Link } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header/Header.tsx';

function Home() {
  return (
    <section>
      <Header />
      <h1>FLASHBACK</h1>
      <h3>◆ Study Smarter, The Retro Way ◆</h3>
      <p>Create, organize, and master your flashcards with vintage vibes</p>
      <div className="ButtonContainer">
        <Link to="/folder">
          <button className="CreateFlashcardButton">
            ▶ Create Your Flashcards
          </button>
        </Link>
      </div>
    </section>
  );
}

export default Home;
