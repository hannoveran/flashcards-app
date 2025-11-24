import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDeckCards } from '../api/decks';
import '../styles/Study.css';

interface Card {
  id: number;
  term: string;
  definition: string;
}

function Study() {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [deckId]);

  const loadCards = async () => {
    if (!deckId) return;

    try {
      const data = await getDeckCards(Number(deckId));
      setCards(data);
      setIsLoading(false);

      if (data.length === 0) {
        alert('No cards in this deck!');
        navigate(-1);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
      alert('Failed to load cards');
      navigate(-1);
    }
  };

  const currentCard = cards[currentIndex];
  const progress =
    cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  if (isLoading) {
    return (
      <section className="studyPage">
        <div className="studyPageNavbar">
          <button className="exitStudyButton" onClick={() => navigate(-1)}>
            ◀ Exit Study
          </button>
        </div>
        <main>
          <p
            style={{ color: '#5cc9c9', textAlign: 'center', marginTop: '20vh' }}
          >
            Loading cards...
          </p>
        </main>
      </section>
    );
  }

  return (
    <section className="studyPage">
      <div>
        <div className="studyPageNavbar">
          <button className="exitStudyButton" onClick={() => navigate(-1)}>
            ◀ Exit Study
          </button>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      <main>
        <div className="studyPageMain">
          <div className="progressBarContainer">
            <div className="restartContainer">
              <span>
                PROGRESS: {currentIndex + 1} / {cards.length}
              </span>
              <button onClick={handleRestart}>Restart</button>
            </div>
            <div className="progressBarWrapper">
              <div
                className="progressBar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {!isComplete ? (
            <>
              <div className="computerContainer">
                <div className="computerInnerContainer">
                  <div
                    className="greenScreen"
                    onClick={handleFlip}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="cardContent">
                      {!isFlipped ? (
                        <>
                          <div className="cardLabel">
                            <span>QUESTION:</span>
                          </div>
                          <p className="cardText">{currentCard.term}</p>
                        </>
                      ) : (
                        <>
                          <div className="cardLabel">
                            <span>ANSWER:</span>
                          </div>
                          <p className="cardText">{currentCard.definition}</p>
                        </>
                      )}
                    </div>

                    {!isFlipped && (
                      <div className="clickToFlipSpan">
                        <span>[CLICK TO FLIP]</span>
                      </div>
                    )}
                  </div>

                  <div className="blackBlock"></div>
                </div>
              </div>

              <div className="bottomButtons">
                <button
                  className="previousButton"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
                >
                  <div>
                    <span>Previous</span>
                  </div>
                </button>

                <button className="flipButton" onClick={handleFlip}>
                  <div>
                    <span>FLIP CARD</span>
                  </div>
                </button>

                <button className="nextButton" onClick={handleNext}>
                  <div>
                    <span>Next</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
            /* Закінчення вивчення */
            <div className="completionContainer">
              <div className="completionMessage">
                <p className="completionTitle">★ DECK COMPLETE! ★</p>
                <p className="completionSubtitle">Youve reviewed all cards</p>
                <div className="completionButtons">
                  <button onClick={handleRestart} className="restartButton">
                    ↻ Restart Deck
                  </button>
                  <button onClick={() => navigate(-1)} className="exitButton">
                    ← Back to Decks
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </section>
  );
}

export default Study;
