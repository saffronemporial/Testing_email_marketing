// SaffronQualityQuiz.jsx
import React, { useState, useEffect } from 'react';
import './SaffronQualityQuiz.css';

const SaffronQualityQuiz = () => {
  const [quizState, setQuizState] = useState('intro'); // intro, playing, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [quizProgress, setQuizProgress] = useState(0);

  const quizData = {
    title: "Saffron Mastery Challenge",
    description: "Test your knowledge of saffron quality, grading, and industry standards",
    questions: [
      {
        id: 1,
        question: "What is the highest grade of saffron according to ISO 3632 standards?",
        type: "multiple-choice",
        options: [
          { id: 'a', text: "Grade I (Category 1)", correct: true },
          { id: 'b', text: "Grade II (Category 2)", correct: false },
          { id: 'c', text: "Grade III (Category 3)", correct: false },
          { id: 'd', text: "Grade IV (Category 4)", correct: false }
        ],
        explanation: "Grade I (Category 1) represents the highest quality saffron with crocin content > 200, ensuring superior color strength and aroma.",
        difficulty: "beginner",
        points: 100
      },
      {
        id: 2,
        question: "Which chemical compound is primarily responsible for saffron's distinctive aroma?",
        type: "multiple-choice",
        options: [
          { id: 'a', text: "Crocin", correct: false },
          { id: 'b', text: "Safranal", correct: true },
          { id: 'c', text: "Picrocrocin", correct: false },
          { id: 'd', text: "Kaempferol", correct: false }
        ],
        explanation: "Safranal (C10H14O) is the main aromatic compound that gives saffron its unique hay-like fragrance with sweet notes.",
        difficulty: "intermediate",
        points: 150
      },
      {
        id: 3,
        question: "Identify the quality indicators of premium saffron from the options below:",
        type: "multiple-select",
        options: [
          { id: 'a', text: "Deep red stigma threads", correct: true },
          { id: 'b', text: "Yellow style attached", correct: false },
          { id: 'c', text: "Intense aromatic smell", correct: true },
          { id: 'd', text: "Quick color release in water", correct: true },
          { id: 'e', text: "Uniform thread length", correct: true }
        ],
        explanation: "Premium saffron features deep red stigmas (no yellow styles), intense aroma, quick color release, and uniform 2-3cm thread length.",
        difficulty: "advanced",
        points: 200
      },
      {
        id: 4,
        question: "What is the ideal moisture content for properly dried saffron?",
        type: "multiple-choice",
        options: [
          { id: 'a', text: "5-8%", correct: false },
          { id: 'b', text: "8-12%", correct: true },
          { id: 'c', text: "12-15%", correct: false },
          { id: 'd', text: "15-20%", correct: false }
        ],
        explanation: "8-12% moisture content ensures optimal preservation without compromising aroma or risking mold growth.",
        difficulty: "intermediate",
        points: 150
      },
      {
        id: 5,
        question: "Match the saffron quality parameters with their testing methods:",
        type: "matching",
        pairs: [
          { parameter: "Color Strength", method: "Spectrophotometer at 440nm", correct: true },
          { parameter: "Aroma Quality", method: "Gas Chromatography", correct: true },
          { parameter: "Flavor Bitterness", method: "HPLC Analysis", correct: true },
          { parameter: "Moisture Content", method: "Karl Fischer Titration", correct: true }
        ],
        explanation: "Modern saffron quality testing uses spectrophotometry for color, GC for aroma, HPLC for flavor compounds, and Karl Fischer for moisture.",
        difficulty: "expert",
        points: 250
      },
      {
        id: 6,
        question: "Which region produces the world's most expensive saffron?",
        type: "multiple-choice",
        options: [
          { id: 'a', text: "Kashmir, India", correct: true },
          { id: 'b', text: "La Mancha, Spain", correct: false },
          { id: 'c', text: "Khorasan, Iran", correct: false },
          { id: 'd', text: "Marocco", correct: false }
        ],
        explanation: "Kashmiri saffron commands premium prices due to higher crocin content, geographical indication protection, and traditional harvesting methods.",
        difficulty: "beginner",
        points: 100
      },
      {
        id: 7,
        question: "What is the minimum crocin content required for ISO Grade I saffron?",
        type: "multiple-choice",
        options: [
          { id: 'a', text: "190", correct: false },
          { id: 'b', text: "200", correct: true },
          { id: 'c', text: "210", correct: false },
          { id: 'd', text: "220", correct: false }
        ],
        explanation: "ISO 3632 standards require minimum crocin content of 200 for Category 1 (Grade I) saffron.",
        difficulty: "intermediate",
        points: 150
      },
      {
        id: 8,
        question: "Identify the fake saffron indicators:",
        type: "multiple-select",
        options: [
          { id: 'a', text: "Immediate color release in cold water", correct: true },
          { id: 'b', text: "Sweet smell instead of hay-like", correct: true },
          { id: 'c', text: "Uniform deep red color", correct: false },
          { id: 'd', text: "Yellow styles mixed with threads", correct: true },
          { id: 'e', text: "No aroma when warmed", correct: true }
        ],
        explanation: "Fake saffron often releases color instantly, has artificial sweet smell, contains yellow styles, and lacks proper aroma when heated.",
        difficulty: "advanced",
        points: 200
      }
    ]
  };

  const badges = [
    {
      id: 1,
      name: "Saffron Novice",
      description: "Complete your first quiz",
      icon: "🌱",
      condition: (score, perfect) => score > 0,
      earned: false
    },
    {
      id: 2,
      name: "Quality Inspector",
      description: "Score 80% or higher",
      icon: "🔍",
      condition: (score, perfect) => score >= 800,
      earned: false
    },
    {
      id: 3,
      name: "Saffron Master",
      description: "Achieve perfect score",
      icon: "👑",
      condition: (score, perfect) => perfect,
      earned: false
    },
    {
      id: 4,
      name: "Speed Demon",
      description: "Complete quiz with time remaining",
      icon: "⚡",
      condition: (score, perfect, time) => time > 0,
      earned: false
    },
    {
      id: 5,
      name: "Expert Grader",
      description: "Correctly answer all advanced questions",
      icon: "🎯",
      condition: (score, perfect, time, advancedCorrect) => advancedCorrect,
      earned: false
    }
  ];

  useEffect(() => {
    if (quizState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [quizState, timeLeft]);

  useEffect(() => {
    if (quizState === 'playing') {
      setQuizProgress(((currentQuestion) / quizData.questions.length) * 100);
    }
  }, [currentQuestion, quizState]);

  const startQuiz = () => {
    setQuizState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30 * quizData.questions.length); // 30 seconds per question
    setEarnedBadges([]);
  };

  const handleAnswerSelect = (answerId) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerId);
    const currentQ = quizData.questions[currentQuestion];
    
    if (currentQ.type === 'multiple-choice') {
      const isCorrect = currentQ.options.find(opt => opt.id === answerId)?.correct;
      if (isCorrect) {
        setScore(score + currentQ.points);
      }
    }
    
    setShowExplanation(true);
  };

  const handleMultipleSelect = (answerId) => {
    const currentQ = quizData.questions[currentQuestion];
    // For multiple select, we'll handle scoring after submission
    setSelectedAnswer(prev => {
      if (prev === null) return [answerId];
      if (prev.includes(answerId)) {
        return prev.filter(id => id !== answerId);
      } else {
        return [...prev, answerId];
      }
    });
  };

  const submitMultipleSelect = () => {
    const currentQ = quizData.questions[currentQuestion];
    const selectedOptions = currentQ.options.filter(opt => selectedAnswer.includes(opt.id));
    const correctOptions = currentQ.options.filter(opt => opt.correct);
    
    const allCorrectSelected = correctOptions.every(opt => selectedAnswer.includes(opt.id));
    const noIncorrectSelected = selectedOptions.every(opt => opt.correct);
    
    if (allCorrectSelected && noIncorrectSelected) {
      setScore(score + currentQ.points);
    }
    
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const handleTimeUp = () => {
    finishQuiz();
  };

  const finishQuiz = () => {
    const perfectScore = quizData.questions.reduce((total, q) => total + q.points, 0);
    const advancedCorrect = true; // This would need actual tracking
    
    // Calculate earned badges
    const newBadges = badges.filter(badge => 
      badge.condition(score, score === perfectScore, timeLeft, advancedCorrect)
    );
    
    setEarnedBadges(newBadges);
    setQuizState('results');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    const totalPoints = quizData.questions.reduce((total, q) => total + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    
    if (percentage >= 90) return { message: "Saffron Master!", color: "#FFD700" };
    if (percentage >= 75) return { message: "Quality Expert", color: "#C0C0C0" };
    if (percentage >= 60) return { message: "Knowledgeable Buyer", color: "#CD7F32" };
    return { message: "Learning Enthusiast", color: "#8B4513" };
  };

  const shareResults = () => {
    const performance = getPerformanceMessage();
    const shareText = `I just scored ${score} points in the Saffron Quality Quiz and earned the title "${performance.message}"! Test your saffron knowledge:`;
    // In a real app, this would integrate with social media APIs
    alert(`Share this: ${shareText}`);
  };

  if (quizState === 'intro') {
    return (
      <section id="saffron-quiz" className="quiz-section">
        <div className="quiz-container">
          <div className="quiz-intro">
            <div className="intro-header">
              <h2 className="quiz-title">
                <span className="title-sparkle">Saffron Quality Mastery Quiz</span>
              </h2>
              <p className="quiz-subtitle">Test Your Knowledge, Earn Badges, Become an Expert</p>
            </div>
            
            <div className="quiz-features">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h4>Quality Grading</h4>
                <p>Learn ISO standards and quality parameters</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h4>Timed Challenge</h4>
                <p>30 seconds per question to test your speed</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h4>Earn Badges</h4>
                <p>Collect achievements and prove your expertise</p>
              </div>
            </div>

            <div className="quiz-stats">
              <div className="stat">
                <div className="stat-number">{quizData.questions.length}</div>
                <div className="stat-label">Questions</div>
              </div>
              <div className="stat">
                <div className="stat-number">{formatTime(30 * quizData.questions.length)}</div>
                <div className="stat-label">Total Time</div>
              </div>
              <div className="stat">
                <div className="stat-number">5</div>
                <div className="stat-label">Badges Available</div>
              </div>
            </div>

            <button className="start-quiz-btn" onClick={startQuiz}>
              Start Quality Challenge
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (quizState === 'results') {
    const performance = getPerformanceMessage();
    const totalPoints = quizData.questions.reduce((total, q) => total + q.points, 0);
    
    return (
      <section id="saffron-quiz" className="quiz-section">
        <div className="quiz-container">
          <div className="quiz-results">
            <div className="results-header">
              <h2 className="results-title">Quiz Complete!</h2>
              <div className="performance-badge" style={{ borderColor: performance.color }}>
                <span className="performance-title">{performance.message}</span>
              </div>
            </div>

            <div className="score-display">
              <div className="score-circle">
                <div className="score-value">{score}</div>
                <div className="score-total">/ {totalPoints}</div>
                <div className="score-percentage">
                  {Math.round((score / totalPoints) * 100)}%
                </div>
              </div>
            </div>

            {earnedBadges.length > 0 && (
              <div className="badges-earned">
                <h3>Badges Earned</h3>
                <div className="badges-grid">
                  {earnedBadges.map(badge => (
                    <div key={badge.id} className="badge-card earned">
                      <div className="badge-icon">{badge.icon}</div>
                      <div className="badge-info">
                        <h4>{badge.name}</h4>
                        <p>{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="results-actions">
              <button className="action-btn primary" onClick={startQuiz}>
                Try Again
              </button>
              <button className="action-btn secondary" onClick={shareResults}>
                Share Results
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentQ = quizData.questions[currentQuestion];

  return (
    <section id="saffron-quiz" className="quiz-section">
      <div className="quiz-container">
        {/* Quiz Header */}
        <div className="quiz-header">
          <div className="quiz-info">
            <h3 className="quiz-category">Saffron Quality Challenge</h3>
            <div className="question-counter">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </div>
          </div>
          <div className="quiz-meta">
            <div className="time-remaining">
              <div className="time-icon">⏱️</div>
              <div className="time-value">{formatTime(timeLeft)}</div>
            </div>
            <div className="score-display-mini">
              <span className="score-label">Score:</span>
              <span className="score-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${quizProgress}%` }}
          ></div>
          <div className="progress-labels">
            <span>Quality Basics</span>
            <span>Advanced Grading</span>
            <span>Expert Level</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="question-area">
          <div className="question-card">
            <div className="question-header">
              <span className="difficulty-badge {currentQ.difficulty}">
                {currentQ.difficulty.toUpperCase()}
              </span>
              <span className="points-value">+{currentQ.points} pts</span>
            </div>
            
            <h3 className="question-text">{currentQ.question}</h3>

            {currentQ.type === 'multiple-choice' && (
              <div className="options-grid">
                {currentQ.options.map(option => (
                  <button
                    key={option.id}
                    className={`option-btn ${
                      selectedAnswer === option.id 
                        ? option.correct 
                          ? 'correct' 
                          : 'incorrect'
                        : ''
                    } ${selectedAnswer !== null && option.correct ? 'show-correct' : ''}`}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="option-letter">{option.id.toUpperCase()}</span>
                    <span className="option-text">{option.text}</span>
                    {selectedAnswer !== null && option.correct && (
                      <span className="correct-indicator">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'multiple-select' && (
              <div className="options-grid multiple-select">
                {currentQ.options.map(option => (
                  <button
                    key={option.id}
                    className={`option-btn ${
                      Array.isArray(selectedAnswer) && selectedAnswer.includes(option.id) 
                        ? 'selected' 
                        : ''
                    }`}
                    onClick={() => handleMultipleSelect(option.id)}
                    disabled={showExplanation}
                  >
                    <span className="option-checkbox">
                      {Array.isArray(selectedAnswer) && selectedAnswer.includes(option.id) && '✓'}
                    </span>
                    <span className="option-text">{option.text}</span>
                  </button>
                ))}
                {!showExplanation && (
                  <button 
                    className="submit-multiple-btn"
                    onClick={submitMultipleSelect}
                    disabled={!selectedAnswer || selectedAnswer.length === 0}
                  >
                    Submit Selection
                  </button>
                )}
              </div>
            )}

            {showExplanation && (
              <div className="explanation-box">
                <h4>Expert Explanation</h4>
                <p>{currentQ.explanation}</p>
                <button className="next-question-btn" onClick={nextQuestion}>
                  {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Footer */}
        <div className="quiz-footer">
          <div className="lifelines">
            <button className="lifeline-btn" disabled>
              <span className="lifeline-icon">🕒</span>
              +30s
            </button>
            <button className="lifeline-btn" disabled>
              <span className="lifeline-icon">❓</span>
              50:50
            </button>
            <button className="lifeline-btn" disabled>
              <span className="lifeline-icon">📊</span>
              Skip
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SaffronQualityQuiz;