import { useMemo, useState } from "react";
import {
  deck,
  shuffleDeck,
  WIN_SCORE,
  STARTING_SCORE,
  getCategoryLabel,
} from "./data/deck";
import "./index.css";
import { studyTerms } from "./data/studyData";

const PLAYER_OPTIONS = [2, 3, 4];

function createPlayers(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Player ${index + 1}`,
    score: STARTING_SCORE,
  }));
}

function clampScore(score) {
  return Math.max(0, score);
}

function App() {
  const [screen, setScreen] = useState("home");
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState(createPlayers(2));
  const [turnIndex, setTurnIndex] = useState(0);
  const [drawPile, setDrawPile] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [message, setMessage] = useState("Welcome to Flip & Grow.");
  const [winner, setWinner] = useState(null);
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const [awaitingTarget, setAwaitingTarget] = useState(false);
  const [extraDrawPending, setExtraDrawPending] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showQuizResult, setShowQuizResult] = useState(false);

  const activePlayer = players[turnIndex] || null;

  const scoreboard = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  function startGame() {
    const newPlayers = createPlayers(playerCount);
    setPlayers(newPlayers);
    setTurnIndex(0);
    setDrawPile(shuffleDeck(deck));
    setCurrentCard(null);
    setWinner(null);
    setAwaitingChoice(false);
    setAwaitingTarget(false);
    setExtraDrawPending(false);
    setMessage(`Game started. ${newPlayers[0].name} goes first.`);
    setScreen("game");
  }

  function restartGame() {
    const newPlayers = createPlayers(playerCount);
    setPlayers(newPlayers);
    setTurnIndex(0);
    setDrawPile(shuffleDeck(deck));
    setCurrentCard(null);
    setWinner(null);
    setAwaitingChoice(false);
    setAwaitingTarget(false);
    setExtraDrawPending(false);
    setMessage(`Game restarted. ${newPlayers[0].name} goes first.`);
    setScreen("game");
  }

  function backToHome() {
    setScreen("home");
    setCurrentCard(null);
    setMessage("Welcome to Flip & Grow.");
    setWinner(null);
    setAwaitingChoice(false);
    setAwaitingTarget(false);
    setExtraDrawPending(false);
  }
  function openStudyGuide() {
  setScreen("study");
}

function startQuiz() {
  setQuizIndex(0);
  setQuizScore(0);
  setSelectedAnswer("");
  setShowQuizResult(false);
  setScreen("quiz");
}

function submitQuizAnswer() {
  if (!selectedAnswer) return;

  const currentQuestion = studyTerms[quizIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  if (isCorrect) {
    setQuizScore((prev) => prev + 1);
  }

  setShowQuizResult(true);
}

function nextQuizQuestion() {
  if (quizIndex < studyTerms.length - 1) {
    setQuizIndex((prev) => prev + 1);
    setSelectedAnswer("");
    setShowQuizResult(false);
  } else {
    setScreen("quiz-finish");
  }
}

function backHomeFromLearning() {
  setSelectedAnswer("");
  setShowQuizResult(false);
  setQuizIndex(0);
  setQuizScore(0);
  setScreen("home");
}

  function drawCard() {
    if (!activePlayer || winner || awaitingChoice || awaitingTarget) return;

    let nextPile = [...drawPile];
    if (nextPile.length === 0) {
      nextPile = shuffleDeck(deck);
    }

    const drawn = nextPile[0];
    const remaining = nextPile.slice(1);

    setCurrentCard(drawn);
    setDrawPile(remaining);

    const categoryLabel = getCategoryLabel(drawn.category);
    setMessage(`${activePlayer.name} drew a ${categoryLabel} card: ${drawn.title}.`);

    if (drawn.effectType === "choiceGain") {
      setAwaitingChoice(true);
      return;
    }

    if (drawn.effectType === "targetLose" || drawn.effectType === "targetSteal") {
      setAwaitingTarget(true);
    }
  }

  function finishTurn(nextPlayers, nextTurnIndex, customMessage) {
    const winningPlayer = nextPlayers.find((player) => player.score >= WIN_SCORE);

    if (winningPlayer) {
      setWinner(winningPlayer);
      setScreen("win");
      setCurrentCard(null);
      setAwaitingChoice(false);
      setAwaitingTarget(false);
      setExtraDrawPending(false);
      setMessage(`${winningPlayer.name} wins with ${winningPlayer.score} Wealth Points.`);
      return;
    }

    setPlayers(nextPlayers);
    setTurnIndex(nextTurnIndex);
    setCurrentCard(null);
    setAwaitingChoice(false);
    setAwaitingTarget(false);
    setExtraDrawPending(false);
    setMessage(customMessage);
  }

  function endTurnManually() {
    if (!activePlayer || winner || awaitingChoice || awaitingTarget) return;

    const nextTurnIndex = (turnIndex + 1) % players.length;
    finishTurn(players, nextTurnIndex, `${players[nextTurnIndex].name}'s turn.`);
  }

  function applyCardResult(success = true) {
    if (!currentCard || !activePlayer || winner || awaitingChoice || awaitingTarget) return;

    let updatedPlayers = [...players];
    const nextTurnIndex = (turnIndex + 1) % players.length;
    let nextMessage = `${players[nextTurnIndex].name}'s turn.`;

    switch (currentCard.effectType) {
      case "term": {
        if (success) {
          updatedPlayers = updatedPlayers.map((player) =>
            player.id === activePlayer.id
              ? { ...player, score: clampScore(player.score + currentCard.points) }
              : player
          );
          nextMessage = `${activePlayer.name} got it right and earned +${currentCard.points}. ${players[nextTurnIndex].name}'s turn.`;
        } else {
          nextMessage = `${activePlayer.name} missed it. ${players[nextTurnIndex].name}'s turn.`;
        }
        break;
      }

      case "scenario": {
        if (success) {
          updatedPlayers = updatedPlayers.map((player) =>
            player.id === activePlayer.id
              ? { ...player, score: clampScore(player.score + currentCard.points) }
              : player
          );
          nextMessage = `${activePlayer.name} handled the scenario and earned +${currentCard.points}. ${players[nextTurnIndex].name}'s turn.`;
        } else {
          nextMessage = `${activePlayer.name} did not score on the scenario. ${players[nextTurnIndex].name}'s turn.`;
        }
        break;
      }

      case "selfGain": {
        updatedPlayers = updatedPlayers.map((player) =>
          player.id === activePlayer.id
            ? { ...player, score: clampScore(player.score + currentCard.value) }
            : player
        );
        nextMessage = `${activePlayer.name} gained +${currentCard.value}. ${players[nextTurnIndex].name}'s turn.`;
        break;
      }

      case "allLose": {
        updatedPlayers = updatedPlayers.map((player) => ({
          ...player,
          score: clampScore(player.score - currentCard.value),
        }));
        nextMessage = `Market Crash hit everyone for -${currentCard.value}. ${players[nextTurnIndex].name}'s turn.`;
        break;
      }

      case "gainAndDraw": {
        updatedPlayers = updatedPlayers.map((player) =>
          player.id === activePlayer.id
            ? { ...player, score: clampScore(player.score + currentCard.value) }
            : player
        );

        const winningPlayer = updatedPlayers.find((player) => player.score >= WIN_SCORE);
        if (winningPlayer) {
          setPlayers(updatedPlayers);
          setWinner(winningPlayer);
          setScreen("win");
          setCurrentCard(null);
          setAwaitingChoice(false);
          setAwaitingTarget(false);
          setExtraDrawPending(false);
          setMessage(`${winningPlayer.name} wins with ${winningPlayer.score} Wealth Points.`);
          return;
        }

        setPlayers(updatedPlayers);
        setCurrentCard(null);
        setAwaitingChoice(false);
        setAwaitingTarget(false);
        setExtraDrawPending(true);
        setMessage(`${activePlayer.name} gained +${currentCard.value} and gets to draw again.`);
        return;
      }

      default:
        break;
    }

    finishTurn(updatedPlayers, nextTurnIndex, nextMessage);
  }

  function handleChoiceGain(type) {
    if (!currentCard || !activePlayer || !awaitingChoice) return;

    const gain = type === "later" ? currentCard.laterValue : currentCard.nowValue;

    const updatedPlayers = players.map((player) =>
      player.id === activePlayer.id
        ? { ...player, score: clampScore(player.score + gain) }
        : player
    );

    const nextTurnIndex = (turnIndex + 1) % players.length;

    finishTurn(
      updatedPlayers,
      nextTurnIndex,
      `${activePlayer.name} chose +${gain}. ${players[nextTurnIndex].name}'s turn.`
    );
  }

  function handleTargetPlayer(targetId) {
    if (!currentCard || !activePlayer || !awaitingTarget) return;

    const target = players.find((player) => player.id === targetId);
    if (!target) return;

    let updatedPlayers = [...players];
    let messageText = "";
    const nextTurnIndex = (turnIndex + 1) % players.length;

    if (currentCard.effectType === "targetLose") {
      updatedPlayers = players.map((player) =>
        player.id === targetId
          ? { ...player, score: clampScore(player.score - currentCard.value) }
          : player
      );

      messageText = `${activePlayer.name} hit ${target.name} for -${currentCard.value}. ${players[nextTurnIndex].name}'s turn.`;
    }

    if (currentCard.effectType === "targetSteal") {
      const amountToSteal = Math.min(target.score, currentCard.value);

      updatedPlayers = players.map((player) => {
        if (player.id === targetId) {
          return { ...player, score: clampScore(player.score - amountToSteal) };
        }

        if (player.id === activePlayer.id) {
          return { ...player, score: clampScore(player.score + amountToSteal) };
        }

        return player;
      });

      messageText = `${activePlayer.name} stole ${amountToSteal} point${amountToSteal === 1 ? "" : "s"} from ${target.name}. ${players[nextTurnIndex].name}'s turn.`;
    }

    finishTurn(updatedPlayers, nextTurnIndex, messageText);
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />

      <main className="app-container">
        {screen === "home" && (
          <section className="panel hero-panel">
            <div className="badge">FLIP & GROW</div>
            <h1>Learn. Compete. Grow.</h1>
            <p className="hero-copy">
              Flip cards, earn Wealth Points, and outplay the table.
            </p>

            <div className="panel section-card">
              <h2>Choose players</h2>
              <div className="player-options">
                {PLAYER_OPTIONS.map((count) => (
                  <button
                    key={count}
                    className={`option-btn ${playerCount === count ? "active" : ""}`}
                    onClick={() => {
                      setPlayerCount(count);
                      setPlayers(createPlayers(count));
                    }}
                  >
                    {count} Players
                  </button>
                ))}
              </div>

              <button className="primary-btn" onClick={startGame}>
                Start Game
              </button>
              <div className="mode-actions">
             <button className="primary-btn mode-btn" onClick={startGame}>
               Start Game
            </button>
            <button className="ghost-btn mode-btn" onClick={openStudyGuide}>
               Learn Terms
            </button>
            <button className="gold-btn mode-btn" onClick={startQuiz}>
               Quiz Arena
            </button>
          </div>
            </div>

            <div className="mini-grid">
              <div className="mini-card green">Money Terms</div>
              <div className="mini-card red">Action Cards</div>
              <div className="mini-card blue">Scenarios</div>
              <div className="mini-card gold">Growth Cards</div>
            </div>
          </section>
        )}

        {screen === "study" && (
  <section className="panel hero-panel">
    <div className="badge">Study Guide</div>
    <h1>Learn the Core Terms</h1>
    <p className="hero-copy">
      Review the key money words used throughout Flip & Grow.
    </p>

    <div className="study-list">
      {studyTerms.map((item) => (
        <div key={item.id} className="study-card">
          <div className="study-card-top">
            <span className="study-category">{item.category}</span>
          </div>
          <h2>{item.term}</h2>
          <p>{item.definition}</p>
        </div>
      ))}
    </div>

    <div className="win-actions">
      <button className="primary-btn" onClick={startQuiz}>
        Start Quiz
      </button>
      <button className="ghost-btn" onClick={backHomeFromLearning}>
        Back Home
      </button>
    </div>
  </section>
)}

        {screen === "game" && activePlayer && (
          <section className="game-layout">
            <aside className="panel sidebar">
              <div className="sidebar-top">
                <div className="badge">SCOREBOARD</div>
                <h2>First to {WIN_SCORE}</h2>
              </div>

              <div className="score-list">
                {scoreboard.map((player) => (
                  <div
                    key={player.id}
                    className={`score-item ${player.id === activePlayer.id ? "active" : ""}`}
                  >
                    <span>{player.name}</span>
                    <strong>{player.score}</strong>
                  </div>
                ))}
              </div>

              <div className="panel note-box">
                <p>{message}</p>
              </div>

              <button className="ghost-btn" onClick={backToHome}>
                Exit Game
              </button>
            </aside>

            <section className="panel game-panel">
              <div className="turn-header">
                <div>
                  <div className="badge">CURRENT TURN</div>
                  <h2>{activePlayer.name}</h2>
                </div>
                <div className="turn-score">{activePlayer.score} pts</div>
              </div>

              {!currentCard && !extraDrawPending && (
                <div className="draw-area">
                  
                  <button className="primary-btn large-btn" onClick={drawCard}>
                   <div className="deck-visual">
                     <span>✨</span>
                  </div> Draw Card
                  </button>
                  <button className="ghost-btn" onClick={endTurnManually}>
                    Skip / End Turn
                  </button>
                </div>
              )}

              {!currentCard && extraDrawPending && (
                <div className="draw-area">
                  <div className="deck-visual">
                    <span>🃏</span>
                  </div>
                  <button className="primary-btn large-btn" onClick={drawCard}>
                    Draw Bonus Card
                  </button>
                </div>
              )}

              {currentCard && (
                <div className={`game-card ${currentCard.category}`}>
                  <div className="card-top">
                    <span className="card-chip">{currentCard.icon}</span>
                    <span className="card-category">
                      {getCategoryLabel(currentCard.category)}
                    </span>
                  </div>

                  <div className="card-body">
                    <h3>{currentCard.title}</h3>
                    <p>{currentCard.instruction}</p>
                  </div>

                  <div className="card-actions">
                    {(currentCard.effectType === "term" ||
                      currentCard.effectType === "scenario") && (
                      <>
                        <button className="primary-btn" onClick={() => applyCardResult(true)}>
                          Correct / Complete
                        </button>
                        <button className="ghost-btn" onClick={() => applyCardResult(false)}>
                          Missed It
                        </button>
                      </>
                    )}

                    {(currentCard.effectType === "selfGain" ||
                      currentCard.effectType === "allLose" ||
                      currentCard.effectType === "gainAndDraw") && (
                      <button className="primary-btn" onClick={() => applyCardResult(true)}>
                        Apply Card
                      </button>
                    )}

                    {awaitingChoice && currentCard.effectType === "choiceGain" && (
                      <>
                        <button className="primary-btn" onClick={() => handleChoiceGain("now")}>
                          Take +{currentCard.nowValue} Now
                        </button>
                        <button className="gold-btn" onClick={() => handleChoiceGain("later")}>
                          Take +{currentCard.laterValue} Later
                        </button>
                      </>
                    )}

                    {awaitingTarget &&
                      (currentCard.effectType === "targetLose" ||
                        currentCard.effectType === "targetSteal") && (
                        <div className="target-grid">
                          {players
                            .filter((player) => player.id !== activePlayer.id)
                            .map((player) => (
                              <button
                                key={player.id}
                                className="target-btn"
                                onClick={() => handleTargetPlayer(player.id)}
                              >
                                {currentCard.effectType === "targetSteal"
                                  ? "Steal from"
                                  : "Hit"}{" "}
                                {player.name}
                              </button>
                            ))}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </section>
          </section>
        )}
        {screen === "quiz" && (
  <section className="panel hero-panel">
    <div className="badge">Quiz Mode</div>
    <h1>{studyTerms[quizIndex].term}</h1>
    <p className="hero-copy">
      Question {quizIndex + 1} of {studyTerms.length}
    </p>

    <div className="quiz-card">
      <p className="quiz-question">What is the best definition?</p>

      <div className="quiz-options">
        {studyTerms[quizIndex].quizOptions.map((option) => (
          <button
            key={option}
            className={`quiz-option ${selectedAnswer === option ? "selected" : ""}`}
            onClick={() => setSelectedAnswer(option)}
            disabled={showQuizResult}
          >
            {option}
          </button>
        ))}
      </div>

      {!showQuizResult ? (
        <button className="primary-btn" onClick={submitQuizAnswer}>
          Submit Answer
        </button>
      ) : (
        <div className="quiz-result-block">
          <p className="hero-copy">
            {selectedAnswer === studyTerms[quizIndex].correctAnswer
              ? "Correct!"
              : `Not quite. Correct answer: ${studyTerms[quizIndex].correctAnswer}`}
          </p>
          <button className="gold-btn" onClick={nextQuizQuestion}>
            {quizIndex < studyTerms.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </div>

    <div className="win-actions">
      <button className="ghost-btn" onClick={backHomeFromLearning}>
        Back Home
      </button>
    </div>
  </section>
)}      {screen === "quiz-finish" && (
  <section className="panel win-panel">
    <div className="badge">Quiz Complete</div>
    <h1>{quizScore} / {studyTerms.length}</h1>
    <p className="hero-copy">
      Nice work. You finished the Flip & Grow quiz.
    </p>

    <div className="win-actions">
      <button className="primary-btn" onClick={startQuiz}>
        Try Again
      </button>
      <button className="gold-btn" onClick={openStudyGuide}>
        Review Terms
      </button>
      <button className="ghost-btn" onClick={backHomeFromLearning}>
        Back Home
      </button>
    </div>
  </section>
)}
        {screen === "win" && winner && (
          <section className="panel win-panel">
            <div className="badge">Winner</div>
            <h1>{winner.name} Wins</h1>
            <p className="hero-copy">
    reached <strong>{winner.score} Wealth Points</strong> and took the game.
  </p>

            <div className="win-actions">
              <button className="primary-btn" onClick={restartGame}>
                Play Again
              </button>
              <button className="ghost-btn" onClick={backToHome}>
                Back Home
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;