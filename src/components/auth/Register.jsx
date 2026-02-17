import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaBook, FaUniversity } from 'react-icons/fa';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '', email: '', motDePasse: '', confirmPassword: '',
    niveauEtude: '', domaineEtude: '', universite: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.motDePasse !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await authService.register(userData);
      toast.success('Inscription réussie !');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom complet</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom complet" required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="motDePasse" value={formData.motDePasse} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Niveau d'études</label>
              <div className="input-wrapper">
                <FaGraduationCap className="input-icon" />
                <input type="text" name="niveauEtude" value={formData.niveauEtude} onChange={handleChange} placeholder="ex. Licence, Master..." />
              </div>
            </div>
            <div className="form-group">
              <label>Domaine d'études</label>
              <div className="input-wrapper">
                <FaBook className="input-icon" />
                <input type="text" name="domaineEtude" value={formData.domaineEtude} onChange={handleChange} placeholder="ex. Informatique, Commerce..." />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Université</label>
            <div className="input-wrapper">
              <FaUniversity className="input-icon" />
              <input type="text" name="universite" value={formData.universite} onChange={handleChange} placeholder="ex. Université de Paris" />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>
        <p className="auth-link">Vous avez déjà un compte ? <Link to="/login">Connexion</Link></p>
      </div>
    </div>
  );
};

export default Register;