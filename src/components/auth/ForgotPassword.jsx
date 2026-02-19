import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: new password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }
    setLoading(true);
    try {
      await authService.checkEmail(email);
      toast.success('Email trouvé, veuillez saisir le nouveau mot de passe');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Email incorrect ou n'existe pas (email n'existe pas)");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, newPassword);
      toast.success('Mot de passe réinitialisé avec succès');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mot de passe oublié (étudiant)</h2>
        <p className="auth-hint" style={{ marginBottom: '1.5rem' }}>
          Si vous avez oublié votre mot de passe, entrez votre email et entrez le nouveau mot de passe.
        </p>

        {step === 1 && (
          <form onSubmit={handleVerifyEmail}>
            <div className="form-group">
              <label>Email de l'étudiant</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email étudiant enregistré"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Vérification...' : 'Vérifier l\'email'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Modification...' : 'Confirmer le nouveau mot de passe'}
            </button>
          </form>
        )}

        <p className="auth-link" style={{ marginTop: '1.5rem' }}>
          <FaKey style={{ marginInlineEnd: '0.5rem' }} />
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

