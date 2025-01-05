import React, { useState, useEffect, useRef } from "react";
import questionsData from "../data/full_questions.json"; // Adjust the path as necessary
import { Link } from "react-router-dom";
import { FaHome, FaDownload } from "react-icons/fa"; // Add FaDownload import

type Answer = {
  id: string;
  answer: string;
  isCorrect: boolean;
};

type Question = {
  questionId: number;
  question: string;
  answers: Answer[];
};

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const [savedQuestionId, setSavedQuestionId] = useState<number | null>(() => {
    const saved = localStorage.getItem("savedQuestionId");
    return saved ? Number(saved) : null;
  });
  const [pageInput, setPageInput] = useState<string>(String(currentPage));
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, Record<string, boolean>>>({});
  const [disabledCheckboxes, setDisabledCheckboxes] = useState<boolean[]>([]);
  const [correctCounts, setCorrectCounts] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem("correctCounts");
    return saved ? JSON.parse(saved) : {};
  });
  const [incorrectCounts, setIncorrectCounts] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem("incorrectCounts");
    return saved ? JSON.parse(saved) : {};
  });
  const [answerMessages, setAnswerMessages] = useState<Record<number, string>>({});

  useEffect(() => {
    const sortedQuestions = [...questionsData].sort(
      (a, b) => a.questionId - b.questionId
    );
    setQuestions(sortedQuestions);
  }, []);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setShowCorrectAnswers(new Array(questions.length).fill(false));
    const initialSelectedAnswers: Record<number, Record<string, boolean>> = {};
    questions.forEach((question) => {
      initialSelectedAnswers[question.questionId] = {};
    });
    setSelectedAnswers(initialSelectedAnswers);
    setDisabledCheckboxes(new Array(questions.length).fill(false));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("correctCounts", JSON.stringify(correctCounts));
  }, [correctCounts]);

  useEffect(() => {
    localStorage.setItem("incorrectCounts", JSON.stringify(incorrectCounts));
  }, [incorrectCounts]);

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => {
      const newPage = prev + 1;
      setTimeout(() => {
        const firstQuestionIndex = (newPage - 1) * questionsPerPage;
        const element = questionRefs.current[firstQuestionIndex];
        if (element) {
          const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 71;
          window.scrollTo({ top: topOffset, behavior: 'instant' });
        }
      }, 0);
      return newPage;
    });
  };

  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleQuestionsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setQuestionsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing questions per page
  };

  const handlePageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageInput(event.target.value);
  };

  const handlePageInputBlur = () => {
    const pageNumber = Number(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handlePageInputBlur();
    }
  };

  const handleSaveQuestion = (questionId: number) => {
    setSavedQuestionId(questionId);
    localStorage.setItem("savedQuestionId", String(questionId));
  };

  const handleLoadQuestion = () => {
    if (savedQuestionId !== null) {
      const questionIndex = questions.findIndex(
        (q) => q.questionId === savedQuestionId
      );
      if (questionIndex !== -1) {
        const page = Math.ceil((questionIndex + 1) / questionsPerPage);
        setCurrentPage(page);
        setTimeout(() => {
          const element = questionRefs.current[questionIndex];
          if (element) {
            const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 71;
            window.scrollTo({ top: topOffset, behavior: "smooth" });
          }
        }, 0);
      }
    }
  };

  const handleShowAnswer = (index: number) => {
    setShowCorrectAnswers((prev) => {
      const newShowCorrectAnswers = [...prev];
      newShowCorrectAnswers[index] = !newShowCorrectAnswers[index];
      return newShowCorrectAnswers;
    });
    setDisabledCheckboxes((prev) => {
      const newDisabledCheckboxes = [...prev];
      newDisabledCheckboxes[index] = !newDisabledCheckboxes[index];
      return newDisabledCheckboxes;
    });

    if (!showCorrectAnswers[index]) {
      const question = questions[index];
      const allCorrect = question.answers.every(
        (answer) =>
          (answer.isCorrect && selectedAnswers[question.questionId][answer.id]) ||
          (!answer.isCorrect && !selectedAnswers[question.questionId][answer.id])
      );
      const anyIncorrect = question.answers.some(
        (answer) =>
          !answer.isCorrect && selectedAnswers[question.questionId][answer.id]
      );

      if (allCorrect && !anyIncorrect) {
        setCorrectCounts((prevCounts) => ({
          ...prevCounts,
          [question.questionId]: (prevCounts[question.questionId] || 0) + 1,
        }));
        setAnswerMessages((prevMessages) => ({
          ...prevMessages,
          [question.questionId]: "Correct",
        }));
      } else {
        setIncorrectCounts((prevCounts) => ({
          ...prevCounts,
          [question.questionId]: (prevCounts[question.questionId] || 0) + 1,
        }));
        setAnswerMessages((prevMessages) => ({
          ...prevMessages,
          [question.questionId]: "Incorrect",
        }));
      }
    } else {
      setAnswerMessages((prevMessages) => ({
        ...prevMessages,
        [questions[index].questionId]: "",
      }));
    }
  };

  const handleCheckboxChange = (questionId: number, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [answerId]: !prev[questionId]?.[answerId],
      },
    }));
  };

  const handleClearCounts = (questionId: number) => {
    setCorrectCounts((prevCounts) => ({
      ...prevCounts,
      [questionId]: 0,
    }));
    setIncorrectCounts((prevCounts) => ({
      ...prevCounts,
      [questionId]: 0,
    }));
    setAnswerMessages((prevMessages) => ({
      ...prevMessages,
      [questionId]: "",
    }));
  };

  const handleScrollUp = (index: number) => {
    const element = questionRefs.current[index];
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 71;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="pagination-controls fixed-top d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
        <div>
          <label htmlFor="questionsPerPage" className="me-2">
            Per page: {" "}
          </label>
          <select
            id="questionsPerPage"
            value={questionsPerPage}
            onChange={handleQuestionsPerPageChange}
            className="form-select d-inline-block w-auto"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={questions.length}>All</option>
          </select>
        </div>
        <div>
          <span className="me-2">
            Page {currentPage} of {totalPages}
          </span>
          <input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyPress={handlePageInputKeyPress}
            className="form-control d-inline-block w-auto"
            min="1"
            max={totalPages}
          />
        </div>
      </div>
      <div className="questions-container" style={{ marginTop: "3rem" }}>
        {currentQuestions.map((question, index) => (
          <div
            key={question.questionId}
            className="card exam-question-card mb-3"
            ref={(el) =>
              (questionRefs.current[indexOfFirstQuestion + index] = el)
            }
          >
            <div className="card-header text-white bg-primary d-flex justify-content-between align-items-center">
              <span>
                Question #{question.questionId} (<span className="correct-count">+ {correctCounts[question.questionId] || 0}</span>, <span className="incorrect-count">- {incorrectCounts[question.questionId] || 0}</span>)
              </span>
              <div>
                <button
                  onClick={() => handleClearCounts(question.questionId)}
                  className="btn btn-sm btn-outline-light mr-2"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleSaveQuestion(question.questionId)}
                  className="btn btn-sm btn-outline-light"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="card-body question-body">
              <p className="card-text">{question.question}</p>
              <ul>
                {question.answers.map((answer) => (
                  <li
                    key={answer.id}
                    className={`multi-choice-item ${
                      showCorrectAnswers[indexOfFirstQuestion + index] && answer.isCorrect ? "correct-answer" : ""
                    } ${showCorrectAnswers[indexOfFirstQuestion + index] && selectedAnswers[question.questionId]?.[answer.id] && !answer.isCorrect ? "incorrect-answer" : ""}`}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedAnswers[question.questionId]?.[answer.id] || false}
                        onChange={() => handleCheckboxChange(question.questionId, answer.id)}
                        className="me-2"
                        disabled={disabledCheckboxes[indexOfFirstQuestion + index]}
                      />
                      {answer.answer}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between align-items-center">
                <button
                  onClick={() => handleScrollUp(indexOfFirstQuestion + index)}
                  className="btn btn-sm btn-outline-secondary"
                >
                  Scroll Up
                </button>
                <div className="check-answer-container">
                  {answerMessages[question.questionId] === "Correct" && (
                    <span className="correct-message">Correct</span>
                  )}
                  {answerMessages[question.questionId] === "Incorrect" && (
                    <span className="incorrect-message">Incorrect</span>
                  )}
                  <button
                    onClick={() => handleShowAnswer(indexOfFirstQuestion + index)}
                    className={`btn btn-sm ${showCorrectAnswers[indexOfFirstQuestion + index] ? "btn-success" : "btn-outline-secondary"}`}
                  >
                    {showCorrectAnswers[indexOfFirstQuestion + index] ? "Hide Answer" : "Check Answer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination-controls fixed-bottom d-flex justify-content-between align-items-center p-3 bg-light border-top">
        <div>
          <Link to="/">
            <button className="btn btn-secondary btn-success">
              <FaHome /> {/* Use the home icon here */}
            </button>
          </Link>
          {savedQuestionId !== null && (
            <button onClick={handleLoadQuestion} className="btn btn-secondary btn-warning">
              <FaDownload /> #{savedQuestionId}
            </button>
          )}
        </div>
        <div>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="btn btn-primary me-2"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={indexOfLastQuestion >= questions.length}
            className="btn btn-primary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;