import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Composants
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import Register from './components/auth/Register';
import Profile from './components/utilisateur/Profile';
import DashboardEtudiant from './components/etudiant/DashboardEtudiant';
import DashboardAdmin from './components/administrateur/DashboardAdmin';
import GestionUtilisateurs from './components/administrateur/GestionUtilisateurs';

// Styles
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Toaster position="top-right" />
          
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            
            {/* Routes protégées */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/etudiant/dashboard" element={<PrivateRoute roles={['ETUDIANT']}><DashboardEtudiant /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute roles={['ADMIN']}><DashboardAdmin /></PrivateRoute>} />
            <Route path="/admin/utilisateurs" element={<PrivateRoute roles={['ADMIN']}><GestionUtilisateurs /></PrivateRoute>} />
            
            {/* Accueil */}
            <Route path="/" element={
              <div className="home-container">
                <div className="home-content">
                  <h1 className="home-title">Bienvenue sur CV Platform</h1>
                  <p className="home-subtitle">Analysez et optimisez votre CV avec l'intelligence artificielle</p>
                  <div className="home-buttons">
                    <a href="/register" className="home-btn primary">Commencer maintenant</a>
                    <a href="/login" className="home-btn secondary">Se connecter</a>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;