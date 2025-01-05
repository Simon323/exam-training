import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <nav className="nav-squares">
        <Link to="/lern" className="square">Lern</Link>
        <Link to="/training" className="square">Training</Link>
      </nav>
    </div>
  );
}

export default Home;