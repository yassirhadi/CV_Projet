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
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // جلب الإحصائيات
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      // جلب آخر المستخدمين
      const usersRes = await api.get('/admin/utilisateurs?limit=10');
      setRecentUsers(usersRes.data);
    } catch (error) {
      console.error('Erreur chargement admin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Administrateur</h1>
      <p className="welcome">Bienvenue, {user?.nom || 'Admin'}!</p>

      {/* Statistiques */}
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

      {/* Liste des utilisateurs */}
      <div className="users-section">
        <h2>Liste des utilisateurs</h2>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Université</th>
                <th>CVs</th>
                <th>Date inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.nom}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'etudiant'}`}>
                      {user.role === 'ADMIN' ? <FaUserShield /> : <FaUserGraduate />}
                      {user.role}
                    </span>
                  </td>
                  <td>{user.universite || '-'}</td>
                  <td>{user.nb_cv || 0}</td>
                  <td>{new Date(user.dateInscription).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <button className="btn-view" title="Voir détails">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;