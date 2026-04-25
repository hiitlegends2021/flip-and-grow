import { useState } from "react";
import "./App.css";
import "./index.css";

const sounds = {
  click: "/sounds/click.mp3",
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
};

let soundUnlocked = false;

function unlockSound() {
  if (soundUnlocked) return;

  const audio = new Audio(sounds.click);
  audio.volume = 0.01;

  audio
    .play()
    .then(() => {
      soundUnlocked = true;
    })
    .catch(() => {
      soundUnlocked = false;
    });
}

function playTone(type = "click") {
  if (!soundUnlocked) return;

  const audio = new Audio(sounds[type] || sounds.click);
  audio.volume = 0.35;
  audio.play().catch(() => {});
}

const moneyTerms = [
  {
    word: "Cash Flow",
    definition: "The money coming in and going out over a period of time.",
  },
  {
    word: "Net Worth",
    definition: "What you own minus what you owe.",
  },
  {
    word: "Asset",
    definition: "Something valuable that you own or that can help build wealth.",
  },
  {
    word: "Liability",
    definition: "Something you owe or something that takes money from you.",
  },
  {
    word: "Budget",
    definition: "A plan for how your money will be earned, spent, saved, or invested.",
  },
  {
    word: "APR",
    definition: "Annual Percentage Rate — the yearly cost of borrowing money.",
  },
  {
    word: "Credit Utilization",
    definition: "How much of your available credit you are using.",
  },
  {
    word: "Interest",
    definition: "The cost of borrowing money or the money earned from saving/investing.",
  },
  {
    word: "Minimum Payment",
    definition: "The smallest amount you are required to pay on a debt.",
  },
  {
    word: "Debt-to-Income Ratio",
    definition: "How much debt you have compared to how much income you earn.",
  },
  {
    word: "ROI",
    definition: "Return on Investment — how much value you get back from what you put in.",
  },
  {
    word: "Equity",
    definition: "The ownership value you have in something after debt is subtracted.",
  },
  {
    word: "Diversification",
    definition: "Spreading money across different places to reduce risk.",
  },
  {
    word: "Compound Growth",
    definition: "Growth that builds on previous growth over time.",
  },
  {
    word: "Emergency Fund",
    definition: "Money set aside for unexpected expenses.",
  },
];

export default function App() {
  const [players, setPlayers] = useState(2);
  const [screen, setScreen] = useState("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  const currentTerm = moneyTerms[currentIndex];

  function handleSound(type = "click") {
    unlockSound();
    setTimeout(() => playTone(type), 50);
  }

  function startGame() {
    handleSound("click");
    setScreen("game");
    setCurrentIndex(0);
    setCurrentPlayer(0);
    setScores([0, 0, 0, 0]);
    setShowDefinition(false);
  }

  function nextCard(points = 1) {
    handleSound("correct");

    const updatedScores = [...scores];
    updatedScores[currentPlayer] += points;
    setScores(updatedScores);

    if (currentIndex >= moneyTerms.length - 1) {
      setScreen("results");
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setCurrentPlayer((currentPlayer + 1) % players);
    setShowDefinition(false);
  }

  function skipCard() {
    handleSound("wrong");

    if (currentIndex >= moneyTerms.length - 1) {
      setScreen("results");
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setCurrentPlayer((currentPlayer + 1) % players);
    setShowDefinition(false);
  }

  function resetHome() {
    handleSound("click");
    setScreen("home");
    setCurrentIndex(0);
    setCurrentPlayer(0);
    setScores([0, 0, 0, 0]);
    setShowDefinition(false);
  }

  const activeScores = scores.slice(0, players);
  const winnerScore = Math.max(...activeScores);
  const winnerIndex = activeScores.indexOf(winnerScore);

  return (
    <main className="app">
      <div className="app-shell">
        <section className="hero-card">
          <span className="badge">Flip & Grow</span>

          {screen === "home" && (
            <>
              <h1 className="hero-title">Learn. Compete. Grow.</h1>
              <p className="hero-subtitle">
                Flip cards, earn Wealth Points, and outplay the table.
              </p>

              <div className="panel">
                <h2 className="panel-title">Choose players</h2>

                <div className="player-options">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      className={players === num ? "btn btn-selected" : "btn"}
                      onClick={() => {
                        handleSound("click");
                        setPlayers(num);
                      }}
                    >
                      {num} Players
                    </button>
                  ))}
                </div>

                <div className="actions">
                  <button className="btn btn-primary" onClick={startGame}>
                    Start Game
                  </button>

                  <button
                    className="btn"
                    onClick={() => {
                      handleSound("click");
                      setScreen("learn");
                    }}
                  >
                    Learn Terms
                  </button>

                  <button
                    className="btn btn-gold"
                    onClick={() => {
                      handleSound("click");
                      setScreen("quiz");
                    }}
                  >
                    Quiz Arena
                  </button>
                </div>
              </div>

              <div className="money-terms-card">
                <h2>Money Terms</h2>
                <p>
                  Practice core financial words like cash flow, assets,
                  liabilities, APR, credit utilization, ROI, and more.
                </p>
              </div>
            </>
          )}

          {screen === "game" && (
            <>
              <h1 className="hero-title">Game Mode</h1>
              <p className="hero-subtitle">
                Player {currentPlayer + 1}, define the term and earn Wealth
                Points.
              </p>

              <div className="game-card">
                <div className="status-row">
                  <span className="status-pill">
                    Card {currentIndex + 1} of {moneyTerms.length}
                  </span>
                  <span className="status-pill">
                    Player {currentPlayer + 1}'s Turn
                  </span>
                </div>

                <div className="term-card">
                  <h2 className="term-word">{currentTerm.word}</h2>

                  {showDefinition ? (
                    <p className="term-definition">{currentTerm.definition}</p>
                  ) : (
                    <p className="term-definition">
                      Say what this term means before revealing the answer.
                    </p>
                  )}
                </div>

                <div className="button-row">
                  <button
                    className="btn"
                    onClick={() => {
                      handleSound("click");
                      setShowDefinition(!showDefinition);
                    }}
                  >
                    {showDefinition ? "Hide Definition" : "Reveal Definition"}
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => nextCard(1)}
                  >
                    Correct +1
                  </button>

                  <button className="btn" onClick={skipCard}>
                    Skip
                  </button>

                  <button className="btn btn-gold" onClick={resetHome}>
                    End Game
                  </button>
                </div>

                <div className="score-row">
                  {activeScores.map((score, index) => (
                    <span className="score-pill" key={index}>
                      Player {index + 1}: {score}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {screen === "learn" && (
            <>
              <h1 className="hero-title">Learn Terms</h1>
              <p className="hero-subtitle">
                Study the language of money before jumping into the game.
              </p>

              <div className="learn-card">
                <div className="money-terms-card">
                  <h2>Core Money Terms</h2>
                  <ul>
                    {moneyTerms.map((term) => (
                      <li key={term.word}>
                        <strong>{term.word}</strong>
                        <br />
                        <span>{term.definition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="button-row">
                  <button className="btn btn-primary" onClick={startGame}>
                    Start Game
                  </button>

                  <button className="btn" onClick={resetHome}>
                    Back Home
                  </button>
                </div>
              </div>
            </>
          )}

          {screen === "quiz" && (
            <>
              <h1 className="hero-title">Quiz Arena</h1>
              <p className="hero-subtitle">
                Quick challenge mode is coming next. For now, use this as your
                study warm-up.
              </p>

              <div className="quiz-card">
                <div className="term-card">
                  <h2 className="term-word">Challenge Prompt</h2>
                  <p className="term-definition">
                    Pick a term from the list and explain it in a real-life
                    example. Best explanation earns a Wealth Point.
                  </p>
                </div>

                <div className="button-row">
                  <button className="btn btn-primary" onClick={startGame}>
                    Start Game
                  </button>

                  <button className="btn" onClick={resetHome}>
                    Back Home
                  </button>
                </div>
              </div>
            </>
          )}

          {screen === "results" && (
            <>
              <h1 className="hero-title">Final Scores</h1>
              <p className="hero-subtitle">
                Player {winnerIndex + 1} wins with {winnerScore} Wealth Points.
              </p>

              <div className="results-card">
                <div className="score-row">
                  {activeScores.map((score, index) => (
                    <span className="score-pill" key={index}>
                      Player {index + 1}: {score}
                    </span>
                  ))}
                </div>

                <div className="button-row">
                  <button className="btn btn-primary" onClick={startGame}>
                    Play Again
                  </button>

                  <button className="btn" onClick={resetHome}>
                    Back Home
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}