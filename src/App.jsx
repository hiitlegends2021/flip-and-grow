import { useEffect, useMemo, useState } from "react";
import "./index.css";
import { terms } from "./terms";

export default function App() {
  const [loading, setLoading] = useState(true);

  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("learn");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const QUIZ_LENGTH = 10;

  const categories = useMemo(
    () => [
      "All",
      "Credit",
      "Wealth",
      "Investing",
      "Business",
      "Debt",
      "Savings",
      "Economics",
    ],
    []
  );

  const filteredTerms =
    selectedCategory === "All"
      ? terms
      : terms.filter((t) => t.category === selectedCategory);

  const current = filteredTerms[index] || filteredTerms[0] || null;

  const nextCard = () => {
    if (!filteredTerms.length) return;
    setFlipped(false);
    setIndex((prev) => (prev + 1) % filteredTerms.length);
  };

  const prevCard = () => {
    if (!filteredTerms.length) return;
    setFlipped(false);
    setIndex((prev) => (prev - 1 + filteredTerms.length) % filteredTerms.length);
  };

  const resetQuizState = () => {
    setScore(0);
    setQuestion(null);
    setChoices([]);
    setSelectedAnswer(null);
    setFeedback("");
    setQuestionNumber(0);
    setQuizFinished(false);
  };

  const changeCategory = (cat) => {
    setSelectedCategory(cat);
    setIndex(0);
    setFlipped(false);
    resetQuizState();
  };

  const generateQuestion = () => {
    if (!filteredTerms.length) {
      setQuestion(null);
      setChoices([]);
      setSelectedAnswer(null);
      setFeedback("");
      return;
    }

    const randomTerm =
      filteredTerms[Math.floor(Math.random() * filteredTerms.length)];

    const wrongPool =
      selectedCategory === "All"
        ? terms.filter((t) => t.term !== randomTerm.term)
        : filteredTerms.filter((t) => t.term !== randomTerm.term);

    const wrongChoices = [...wrongPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, wrongPool.length));

    const allChoices = [...wrongChoices, randomTerm].sort(
      () => Math.random() - 0.5
    );

    setQuestion(randomTerm);
    setChoices(allChoices);
    setSelectedAnswer(null);
    setFeedback("");
  };

  const handleAnswer = (choice) => {
    if (!question || selectedAnswer || quizFinished) return;

    const isCorrect = choice.term === question.term;

    setSelectedAnswer(choice.term);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback("Correct!");
    } else {
      setFeedback("Try Again");
    }

    setTimeout(() => {
      const nextQuestionNumber = questionNumber + 1;

      if (nextQuestionNumber >= QUIZ_LENGTH) {
        setQuestionNumber(nextQuestionNumber);
        setQuizFinished(true);
        setQuestion(null);
        setChoices([]);
        setSelectedAnswer(null);
        setFeedback("");
      } else {
        setQuestionNumber(nextQuestionNumber);
        generateQuestion();
      }
    }, 1200);
  };

  const startQuiz = () => {
    setMode("quiz");
    setFlipped(false);
    setIndex(0);
    resetQuizState();
  };

  const backToLearning = () => {
    setMode("learn");
    setQuestion(null);
    setChoices([]);
    setSelectedAnswer(null);
    setFeedback("");
    setQuestionNumber(0);
    setQuizFinished(false);
  };

  const restartQuiz = () => {
    resetQuizState();
    generateQuestion();
  };

  const getResultMessage = () => {
    const percent = Math.round((score / QUIZ_LENGTH) * 100);

    if (percent === 100) return "Perfect score. Outstanding work.";
    if (percent >= 80) return "Strong work. You’re building real knowledge.";
    if (percent >= 60) return "Good job. Keep practicing and sharpen your edge.";
    return "Nice start. Review the cards and try again.";
  };

  useEffect(() => {
    if (mode === "quiz" && !quizFinished) {
      generateQuestion();
    }
  }, [mode, selectedCategory]);
  useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1800);

  return () => clearTimeout(timer);
}, []);

  if (!started) {
  if (loading) {
  return (
    <div className="app welcome-screen">
      <div className="welcome-card">
        <h1>Flip & Grow™</h1>
        <p className="subtitle">Powered by Dove Financial</p>
      </div>
    </div>
  );
}
    return (
      <div className="app welcome-screen">
        <div className="welcome-card">
  <h1>Flip & Grow™</h1>
  <p className="subtitle">
    Learn the language of money. Build wealth thinking.
  </p>

  <div className="hero-stats">
    <span>38+ Terms</span>
    <span>Interactive Quizzes</span>
    <span>Financial Literacy</span>
  </div>

  <p className="deck-count">
    Built by Dove Financial
  </p>

  <button className="start-btn" onClick={() => setStarted(true)}>
    Start Learning
  </button>
  </div>
</div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Flip & Grow</h1>
        <p className="subtitle">
          Turning Knowledge Into Wealth, One Card At A Time
        </p>
      </header>

      <div style={{ marginBottom: "16px" }}>
        {mode === "learn" ? (
          <button onClick={startQuiz}>Start 10-Question Test</button>
        ) : (
          <button onClick={backToLearning}>Back to Learning</button>
        )}
      </div>

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => changeCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {mode === "learn" ? (
        current ? (
          <>
            <div
              className={`card ${flipped ? "show-back" : ""}`}
              onClick={() => setFlipped(!flipped)}
            >
              {!flipped ? (
                <div className="card-front">
                  <p className="category">{current.category}</p>
                  <h2 className="term">{current.term}</h2>
                  <p className="tap-hint">Tap card or press Flip</p>
                </div>
              ) : (
                <div className="card-back">
                  <p className="category">{current.category}</p>
                  <p className="definition">{current.definition}</p>
                  <p className="example">{current.example}</p>
                </div>
              )}
            </div>

            <div className="controls">
              <button onClick={prevCard}>Back</button>
              <button onClick={() => setFlipped(!flipped)}>Flip</button>
              <button onClick={nextCard}>Next</button>
            </div>

            <p className="progress">
              Card {index + 1} of {filteredTerms.length}
            </p>
          </>
        ) : (
          <div className="card">
            <p className="example">No terms found in this category yet.</p>
          </div>
        )
      ) : quizFinished ? (
        <div className="card">
          <div className="card-back">
            <p className="category">Test Complete</p>
            <p className="definition">
              You scored {score} out of {QUIZ_LENGTH}
            </p>
            <p className="example">{getResultMessage()}</p>

            <div className="controls" style={{ marginTop: "28px" }}>
              <button onClick={restartQuiz}>Retake Test</button>
              <button onClick={backToLearning}>Back to Learning</button>
            </div>
          </div>
        </div>
      ) : question ? (
        <>
          <div className="card">
            <div className="card-back">
              <p className="category">{question.category}</p>
              <p className="definition">{question.definition}</p>

              <div className="quiz-answers">
                {choices.map((choice) => {
                  const isSelected = selectedAnswer === choice.term;
                  const isCorrect = choice.term === question.term;

                  let inlineStyle = {};

                  if (selectedAnswer) {
                    if (isCorrect) {
                      inlineStyle = { background: "#16a34a", color: "#fff" };
                    } else if (isSelected && !isCorrect) {
                      inlineStyle = { background: "#dc2626", color: "#fff" };
                    }
                  }

                  return (
                    <button
                      key={choice.term}
                      onClick={() => handleAnswer(choice)}
                      style={inlineStyle}
                    >
                      {choice.term}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <p
                  className="progress"
                  style={{
                    marginTop: "20px",
                    color: feedback === "Correct!" ? "#16a34a" : "#dc2626",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {feedback}
                </p>
              )}
            </div>
          </div>

          <p className="progress">
            Question {questionNumber + 1} of {QUIZ_LENGTH}
          </p>
          <p className="progress">Score: {score}</p>
        </>
      ) : (
        <div className="card">
          <p className="example">Loading test...</p>
        </div>
      )}
    </div>
  );
}