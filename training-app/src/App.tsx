import "./App.css";
import "./styles.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import Training from "./components/Training";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lern" element={<Quiz />} />
        <Route path="/training" element={<Training />} />
      </Routes>
    </Router>
  );
}

export default App;
