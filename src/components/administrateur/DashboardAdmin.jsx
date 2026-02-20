import React, { useState, useEffect } from 'react';
import { FaUsers, FaFileAlt, FaUserShield } from 'react-icons/fa';
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

  if (loading) return <div className="loading admin-loading"><div className="loader-spinner"></div>Chargement...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header-card">
        <div className="admin-header-content">
          <h1 className="admin-title">Dashboard Administrateur</h1>
          <p className="admin-welcome">Bienvenue, <span>{user?.nom || 'Admin'}</span> !</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card admin-stat-users">
          <div className="admin-stat-icon-wrap">
            <FaUsers className="admin-stat-icon" />
          </div>
          <div className="admin-stat-body">
            <h3>Total Utilisateurs</h3>
            <p className="admin-stat-number">{stats.totalUtilisateurs}</p>
            <span className="admin-stat-detail">Étudiants: {stats.totalEtudiants}</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-admins">
          <div className="admin-stat-icon-wrap">
            <FaUserShield className="admin-stat-icon" />
          </div>
          <div className="admin-stat-body">
            <h3>Administrateurs</h3>
            <p className="admin-stat-number">{stats.totalAdministrateurs}</p>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-cvs">
          <div className="admin-stat-icon-wrap">
            <FaFileAlt className="admin-stat-icon" />
          </div>
          <div className="admin-stat-body">
            <h3>CVs déposés</h3>
            <p className="admin-stat-number">{stats.totalCVs}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;