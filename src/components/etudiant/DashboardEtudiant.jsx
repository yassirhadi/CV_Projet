import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaFileAlt, FaChartLine, FaStar, FaLock } from 'react-icons/fa';

const DashboardEtudiant = () => {
  const { user } = useAuth();
  const [cvCount, setCvCount] = useState(0);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem('cvCount') || '0', 10);
    setCvCount(isNaN(stored) ? 0 : stored);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Bienvenue, {user?.nom} !</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <FaFileAlt className="stat-icon" />
          <div className="stat-info">
            <h3>Total CVs déposés</h3>
            <p className="stat-number">{cvCount}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <div className="action-icon">
            <FaFileAlt />
          </div>
          <div className="action-content">
            <h3>Déposer mon CV</h3>
            <p>Uploadez votre CV pour l'analyser et le garder en historique.</p>
          </div>
          <Link to="/etudiant/upload-cv" className="action-link">Upload CV</Link>
        </div>

        <div className="action-card" style={{ marginTop: '1.5rem' }}>
          <div className="action-icon">
            <FaLock />
          </div>
          <div className="action-content">
            <h3>Mot de passe</h3>
            <p>Vous pouvez modifier votre mot de passe depuis votre profil.</p>
          </div>
          <Link to="/profile" className="action-link">Changer maintenant</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardEtudiant;