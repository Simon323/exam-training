import React, { useState, useEffect, useRef } from "react";
import questionsData from "../data/full_questions.json"; // Adjust the path as necessary
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa"; // Add this import

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

  useEffect(() => {
    const sortedQuestions = [...questionsData].sort(
      (a, b) => a.questionId - b.questionId
    );
    setQuestions(sortedQuestions);
  }, []);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const nextPage = () => setCurrentPage((prev) => prev + 1);
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
          questionRefs.current[questionIndex]?.scrollIntoView({
            behavior: "smooth",
          });
        }, 0);
      }
    }
  };

  return (
    <div>
      <div className="pagination-controls fixed-top d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
        <div>
          <label htmlFor="questionsPerPage" className="me-2">
            Per page:{" "}
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
              <span>Question #{question.questionId}</span>
              <button
                onClick={() => handleSaveQuestion(question.questionId)}
                className="btn btn-sm btn-outline-light"
              >
                Save
              </button>
            </div>
            <div className="card-body question-body">
              <p className="card-text">{question.question}</p>
              <ul>
                {question.answers.map((answer) => (
                  <li
                    key={answer.id}
                    className={`multi-choice-item ${
                      answer.isCorrect ? "correct-answer" : ""
                    }`}
                  >
                    {answer.answer}
                  </li>
                ))}
              </ul>
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
              Load #{savedQuestionId}
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
