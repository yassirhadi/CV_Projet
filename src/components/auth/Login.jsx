import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetData.email || !resetData.newPassword || !resetData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (resetData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setResetLoading(true);
    try {
      await authService.resetPassword(resetData.email, resetData.newPassword);
      toast.success('Mot de passe réinitialisé avec succès');
      setResetData({ email: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Le backend renvoie un message clair (y compris email لا يوجد)
      toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setResetLoading(false);
    }
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
      toast.success('Connexion réussie !');
      navigate(response.user.role === 'ADMIN' ? '/admin/dashboard' : '/etudiant/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
            </div>
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-link">Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
        <p className="auth-hint">
          Vous pouvez modifier votre mot de passe après connexion depuis <strong>Mon profil</strong>.
        </p>

        <div className="password-reset-section">
          <div className="password-separator">
            <span><FaKey /> Modifier le mot de passe (étudiant)</span>
          </div>
          <form onSubmit={handleResetSubmit} className="password-reset-form">
            <div className="form-group">
              <label>Email de l'étudiant</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  placeholder="email étudiant enregistré"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="newPassword"
                  value={resetData.newPassword}
                  onChange={handleResetChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={resetData.confirmPassword}
                  onChange={handleResetChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={resetLoading}>
              {resetLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;