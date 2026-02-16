import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaGraduationCap, FaUniversity } from 'react-icons/fa';

const Profile = () => {
  const { user, hasRole } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (!userData) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="info-row">
          <FaUser className="info-icon" />
          <div><label>Name</label><p>{userData.nom}</p></div>
        </div>
        <div className="info-row">
          <FaEnvelope className="info-icon" />
          <div><label>Email</label><p>{userData.email}</p></div>
        </div>
        {hasRole('ETUDIANT') && (
          <>
            <div className="info-row">
              <FaGraduationCap className="info-icon" />
              <div><label>Study Level</label><p>{userData.niveauEtude || 'Not specified'}</p></div>
            </div>
            <div className="info-row">
              <FaUniversity className="info-icon" />
              <div><label>University</label><p>{userData.universite || 'Not specified'}</p></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;