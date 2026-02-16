import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaFileAlt, FaChartLine, FaStar } from 'react-icons/fa';

const DashboardEtudiant = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.nom}!</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <FaFileAlt className="stat-icon" />
          <div className="stat-info"><h3>Total CVs</h3><p>3</p></div>
        </div>
        <div className="stat-card">
          <FaChartLine className="stat-icon" />
          <div className="stat-info"><h3>Analyses</h3><p>5</p></div>
        </div>
        <div className="stat-card">
          <FaStar className="stat-icon" />
          <div className="stat-info"><h3>Avg Score</h3><p>72%</p></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEtudiant;