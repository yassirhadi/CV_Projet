import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await authService.register(userData);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="motDePasse" value={formData.motDePasse} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Study Level</label>
              <input type="text" name="niveauEtude" value={formData.niveauEtude} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Study Field</label>
              <input type="text" name="domaineEtude" value={formData.domaineEtude} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>University</label>
            <input type="text" name="universite" value={formData.universite} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;