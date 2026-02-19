import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFilePdf, FaFileWord, FaFileImage, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const UploadCV = () => {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Vérifier le type
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Format non supporté. Utilisez PDF, DOCX, JPG ou PNG');
        e.target.value = '';
        return;
      }

      // Vérifier la taille (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Fichier trop volumineux. Maximum 5MB');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setFileInfo({
        nom: selectedFile.name,
        taille: (selectedFile.size / 1024).toFixed(2),
        type: selectedFile.type.split('/')[1].toUpperCase()
      });
      setUploadSuccess(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FaFilePdf className="file-icon pdf" />;
    if (type.includes('word') || type.includes('document')) return <FaFileWord className="file-icon word" />;
    return <FaFileImage className="file-icon image" />;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);

    try {
      await api.post('/cvs/upload', {
        nomFichier: file.name,
      });

      setUploading(false);
      setUploadSuccess(true);

      const currentCount = parseInt(localStorage.getItem('cvCount') || '0', 10);
      localStorage.setItem('cvCount', String(currentCount + 1));

      toast.success('CV uploadé avec succès !');

      setTimeout(() => {
        navigate('/etudiant/dashboard');
      }, 2000);
    } catch (error) {
      setUploading(false);
      toast.error('Erreur lors de l\'upload');
    }
  };

  return (
    <div className="upload-cv-container">
      <h1>Déposer mon CV</h1>
      <p className="subtitle">Formats acceptés: PDF, DOCX, JPG, PNG (Max 5MB)</p>

      <div className="upload-card">
        {!file ? (
          // Zone d'upload
          <div className="upload-area">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-upload" className="upload-label">
              <FaCloudUploadAlt className="upload-icon" />
              <span>Cliquez pour sélectionner un fichier</span>
              <span className="upload-hint">ou glissez-déposez ici</span>
            </label>
          </div>
        ) : (
          // Aperçu du fichier
          <div className="file-preview">
            <div className="file-info">
              {getFileIcon(file.type)}
              <div className="file-details">
                <h3>{fileInfo.nom}</h3>
                <p>Taille: {fileInfo.taille} Ko • Type: {fileInfo.type}</p>
              </div>
            </div>

            {uploadSuccess ? (
              <div className="upload-success">
                <FaCheckCircle className="success-icon" />
                <p>CV uploadé avec succès!</p>
                <small>Redirection en cours...</small>
              </div>
            ) : (
              <div className="upload-actions">
                <button 
                  className="btn-upload"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Upload en cours...' : 'Confirmer l\'upload'}
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setFile(null);
                    setFileInfo(null);
                  }}
                  disabled={uploading}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCV;