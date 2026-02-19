import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaChartLine, FaUserGraduate, FaUserShield, FaDownload, FaEye } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUtilisateurs: 0,
    totalEtudiants: 0,
    totalAdministrateurs: 0,
    totalCVs: 0,
    totalAnalyses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur chargement admin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Dashboard Administrateur</h1>
          <p className="welcome">Bienvenue, {user?.nom || 'Admin'}!</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/utilisateurs" className="action-link">
            Gérer les utilisateurs
          </Link>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <div className="stat-info">
            <h3>Total Utilisateurs</h3>
            <p className="stat-number">{stats.totalUtilisateurs}</p>
            <small>Étudiants: {stats.totalEtudiants}</small>
          </div>
        </div>

        <div className="stat-card">
          <FaUserShield className="stat-icon" style={{color: '#ef4444'}} />
          <div className="stat-info">
            <h3>Administrateurs</h3>
            <p className="stat-number">{stats.totalAdministrateurs}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaFileAlt className="stat-icon" style={{color: '#10b981'}} />
          <div className="stat-info">
            <h3>CVs déposés</h3>
            <p className="stat-number">{stats.totalCVs}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaChartLine className="stat-icon" style={{color: '#f59e0b'}} />
          <div className="stat-info">
            <h3>Analyses effectuées</h3>
            <p className="stat-number">{stats.totalAnalyses}</p>
          </div>
        </div>
      </div>

      <div className="admin-info-cards">
        <div className="admin-info-card">
          <h2>Vue d'ensemble</h2>
          <p>
            Surveillez rapidement le nombre total d&apos;utilisateurs, de CVs déposés et d&apos;analyses effectuées.
          </p>
        </div>
        <div className="admin-info-card">
          <h2>Gestion détaillée</h2>
          <p>
            Pour voir, filtrer et modifier les utilisateurs, utilisez la page{' '}
            <Link to="/admin/utilisateurs">Admin &gt; Utilisateurs</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;