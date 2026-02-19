import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
        <p className="auth-link">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
        <p className="auth-hint">
          Si vous avez oublié votre mot de passe, cliquez sur{' '}
          <Link to="/mot-de-passe-oublie">oublié mon mot de passe</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;