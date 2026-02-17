import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaGraduationCap, FaBook, FaUniversity, FaLock } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChangerMotDePasse = ({ userId }) => {
  const [formData, setFormData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.nouveauMotDePasse.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/utilisateurs/${userId}/mot-de-passe`, {
        ancienMotDePasse: formData.ancienMotDePasse,
        nouveauMotDePasse: formData.nouveauMotDePasse
      });
      toast.success('Mot de passe modifié avec succès');
      setFormData({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmerMotDePasse: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card password-card">
      <h3><FaLock /> Changer le mot de passe</h3>
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label>Ancien mot de passe</label>
          <input
            type="password"
            name="ancienMotDePasse"
            value={formData.ancienMotDePasse}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            name="nouveauMotDePasse"
            value={formData.nouveauMotDePasse}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            name="confirmerMotDePasse"
            value={formData.confirmerMotDePasse}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  );
};

const Profile = () => {
  const { user, hasRole } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (!userData) return <div className="loading">Chargement...</div>;

  return (
    <div className="profile-container">
      <h1>Mon profil</h1>
      <div className="profile-card">
        <div className="info-row">
          <FaUser className="info-icon" />
          <div><label>Nom</label><p>{userData.nom}</p></div>
        </div>
        <div className="info-row">
          <FaEnvelope className="info-icon" />
          <div><label>Email</label><p>{userData.email}</p></div>
        </div>
        {hasRole('ETUDIANT') && (
          <>
            <div className="info-row">
              <FaGraduationCap className="info-icon" />
              <div><label>Niveau d'études</label><p>{userData.niveauEtude || 'Non renseigné'}</p></div>
            </div>
            <div className="info-row">
              <FaBook className="info-icon" />
              <div><label>Domaine d'études</label><p>{userData.domaineEtude || 'Non renseigné'}</p></div>
            </div>
            <div className="info-row">
              <FaUniversity className="info-icon" />
              <div><label>Université</label><p>{userData.universite || 'Non renseigné'}</p></div>
            </div>
          </>
        )}
      </div>
      {hasRole('ETUDIANT') && (
        <ChangerMotDePasse userId={userData.id} />
      )}
    </div>
  );
};

export default Profile;