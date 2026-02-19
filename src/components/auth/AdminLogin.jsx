import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserShield, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      if (response.user.role !== 'ADMIN') {
        logout();
        toast.error('Accès réservé aux administrateurs');
        return;
      }
      toast.success('Connexion admin réussie !');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card admin-login-card">
        <div className="admin-login-header">
          <FaUserShield className="admin-login-icon" />
          <h2>Connexion Admin</h2>
          <p className="admin-login-subtitle">Espace réservé aux administrateurs</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="emaild'administrateur"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter (Admin)'}
          </button>
        </form>
        <p className="auth-link">
          Vous êtes étudiant ? <Link to="/login">Connexion étudiant</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
