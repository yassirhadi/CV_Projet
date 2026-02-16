import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaEdit, FaTrash, FaUserShield, FaUserGraduate, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('TOUS');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/utilisateurs');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'TOUS') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${nom} ?`)) {
      try {
        await api.delete(`/admin/utilisateurs/${id}`);
        setUsers(users.filter(user => user.id !== id));
        toast.success('Utilisateur supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Erreur:', error);
      }
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'ETUDIANT' : 'ADMIN';
    
    if (window.confirm(`Voulez-vous changer le rôle en ${newRole} ?`)) {
      try {
        await api.put(`/admin/utilisateurs/${id}/role`, { role: newRole });
        
        setUsers(users.map(user => 
          user.id === id ? { ...user, role: newRole } : user
        ));
        
        toast.success('Rôle modifié avec succès');
      } catch (error) {
        toast.error('Erreur lors du changement de rôle');
        console.error('Erreur:', error);
      }
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      nom: user.nom,
      niveauEtude: user.niveauEtude || '',
      domaineEtude: user.domaineEtude || '',
      universite: user.universite || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/utilisateurs/${id}`, editForm);
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, ...editForm } : user
      ));
      
      setEditingId(null);
      toast.success('Utilisateur modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <div className="loading">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="gestion-container">
      <h1>Gestion des Utilisateurs</h1>

      {/* Statistiques */}
      <div className="users-stats">
        <div className="stat-mini">Total: <strong>{users.length}</strong></div>
        <div className="stat-mini">👨‍🎓 Étudiants: <strong>{users.filter(u => u.role === 'ETUDIANT').length}</strong></div>
        <div className="stat-mini">👑 Admins: <strong>{users.filter(u => u.role === 'ADMIN').length}</strong></div>
      </div>

      {/* Recherche et filtres */}
      <div className="search-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="TOUS">Tous les rôles</option>
            <option value="ETUDIANT">Étudiants</option>
            <option value="ADMIN">Administrateurs</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Université</th>
              <th>Niveau</th>
              <th>Date inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        name="nom"
                        value={editForm.nom}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    ) : (
                      <strong>{user.nom}</strong>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'etudiant'}`}>
                      {user.role === 'ADMIN' ? <FaUserShield /> : <FaUserGraduate />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        name="universite"
                        value={editForm.universite}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    ) : (
                      user.universite || '-'
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        name="niveauEtude"
                        value={editForm.niveauEtude}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    ) : (
                      user.niveauEtude || '-'
                    )}
                  </td>
                  <td>{new Date(user.dateInscription).toLocaleDateString('fr-FR')}</td>
                  <td className="actions">
                    {editingId === user.id ? (
                      <>
                        <button className="btn-save" onClick={() => saveEdit(user.id)} title="Sauvegarder">
                          <FaCheck />
                        </button>
                        <button className="btn-cancel" onClick={cancelEdit} title="Annuler">
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-role"
                          onClick={() => handleRoleChange(user.id, user.role)}
                          title="Changer le rôle"
                        >
                          <FaUserShield />
                        </button>
                        <button 
                          className="btn-edit"
                          onClick={() => startEdit(user)}
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(user.id, user.nom)}
                          title="Supprimer"
                          disabled={user.role === 'ADMIN' && user.id === 1}
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Affichage de {filteredUsers.length} sur {users.length} utilisateurs</span>
      </div>
    </div>
  );
};

export default GestionUtilisateurs;