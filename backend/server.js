const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ============================================
// الاتصال بقاعدة البيانات MySQL
// ============================================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hadi', // كلمة المرور صحيحة
  database: 'projet_cv',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL:', err);
    return;
  }
  console.log('✅ Connecté à MySQL (projet_cv)');
});

// ============================================
// Route de test
// ============================================
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend Node.js fonctionne !' });
});

// ============================================
// INSCRIPTION
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, niveauEtude, domaineEtude, universite } = req.body;
    
    console.log('📝 Tentative inscription:', email);

    const [checkEmail] = await db.promise().query(
      'SELECT id FROM utilisateur WHERE email = ?',
      [email]
    );

    if (checkEmail.length > 0) {
      return res.status(409).json({ message: 'Cet email existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const [userResult] = await db.promise().query(
      'INSERT INTO utilisateur (nom, email, password, dateInscription) VALUES (?, ?, ?, NOW())',
      [nom, email, hashedPassword]
    );

    const userId = userResult.insertId;

    await db.promise().query(
      'INSERT INTO etudiant (id, niveauEtude, domaineEtude, universite) VALUES (?, ?, ?, ?)',
      [userId, niveauEtude || '', domaineEtude || '', universite || '']
    );

    console.log('✅ Utilisateur enregistré dans MySQL ID:', userId);

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: userId,
        nom,
        email,
        role: 'ETUDIANT'
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// CONNEXION
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const [users] = await db.promise().query(
      'SELECT * FROM utilisateur WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    const validPassword = await bcrypt.compare(motDePasse, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const [admin] = await db.promise().query(
      'SELECT * FROM administrateur WHERE id = ?',
      [user.id]
    );

    const role = admin.length > 0 ? 'ADMIN' : 'ETUDIANT';

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      'secret_key_temporaire',
      { expiresIn: '24h' }
    );

    let etudiantData = {};
    if (role === 'ETUDIANT') {
      const [etudiant] = await db.promise().query(
        'SELECT * FROM etudiant WHERE id = ?',
        [user.id]
      );
      if (etudiant.length > 0) {
        etudiantData = etudiant[0];
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role,
        ...etudiantData
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Récupérer tous les utilisateurs
// ============================================
app.get('/api/admin/utilisateurs', async (req, res) => {
  try {
    const [users] = await db.promise().query(`
      SELECT u.id, u.nom, u.email, u.dateInscription,
             e.niveauEtude, e.domaineEtude, e.universite,
             CASE WHEN a.id IS NOT NULL THEN 'ADMIN' ELSE 'ETUDIANT' END as role
      FROM utilisateur u
      LEFT JOIN etudiant e ON u.id = e.id
      LEFT JOIN administrateur a ON u.id = a.id
    `);
    res.json(users);
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Récupérer un utilisateur par ID
// ============================================
app.get('/api/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await db.promise().query(`
      SELECT u.id, u.nom, u.email, u.dateInscription,
             e.niveauEtude, e.domaineEtude, e.universite,
             CASE WHEN a.id IS NOT NULL THEN 'ADMIN' ELSE 'ETUDIANT' END as role
      FROM utilisateur u
      LEFT JOIN etudiant e ON u.id = e.id
      LEFT JOIN administrateur a ON u.id = a.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Mettre à jour un utilisateur
// ============================================
app.put('/api/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, niveauEtude, domaineEtude, universite } = req.body;

    await db.promise().query(
      'UPDATE utilisateur SET nom = ? WHERE id = ?',
      [nom, id]
    );

    const [etudiant] = await db.promise().query(
      'SELECT * FROM etudiant WHERE id = ?',
      [id]
    );

    if (etudiant.length > 0) {
      await db.promise().query(
        'UPDATE etudiant SET niveauEtude = ?, domaineEtude = ?, universite = ? WHERE id = ?',
        [niveauEtude || '', domaineEtude || '', universite || '', id]
      );
    }

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Supprimer un utilisateur
// ============================================
app.delete('/api/admin/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM utilisateur WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Changer le rôle d'un utilisateur
// ============================================
app.put('/api/admin/utilisateurs/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role === 'ADMIN') {
      const [existing] = await db.promise().query(
        'SELECT * FROM administrateur WHERE id = ?',
        [id]
      );
      
      if (existing.length === 0) {
        await db.promise().query(
          'INSERT INTO administrateur (id, role, dateDernierConnexion) VALUES (?, ?, NOW())',
          [id, 'admin']
        );
      }
    } else {
      await db.promise().query(
        'DELETE FROM administrateur WHERE id = ?',
        [id]
      );
    }

    res.json({ message: 'Rôle modifié avec succès' });
  } catch (error) {
    console.error('❌ Erreur changement rôle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Statistiques générales (avec score moyen)
// ============================================
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[utilisateurs]] = await db.promise().query('SELECT COUNT(*) as total FROM utilisateur');
    const [[etudiants]] = await db.promise().query('SELECT COUNT(*) as total FROM etudiant');
    const [[admins]] = await db.promise().query('SELECT COUNT(*) as total FROM administrateur');
    const [[cvs]] = await db.promise().query('SELECT COUNT(*) as total FROM cv');
    const [[analyses]] = await db.promise().query('SELECT COUNT(*) as total FROM analyseia');
    
    const [scores] = await db.promise().query('SELECT AVG(scoreGeneral) as moyenne FROM cv WHERE scoreGeneral IS NOT NULL');
    const scoreMoyen = scores[0]?.moyenne || 0;

    res.json({
      totalUtilisateurs: utilisateurs.total,
      totalEtudiants: etudiants.total,
      totalAdministrateurs: admins.total,
      totalCVs: cvs.total,
      totalAnalyses: analyses.total,
      scoreMoyen: Math.round(scoreMoyen)
    });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// GESTION DES CVs (simulée)
// ============================================
app.post('/api/cvs/upload', async (req, res) => {
  try {
    res.json({
      id: Math.floor(Math.random() * 1000),
      nomFichier: req.body.nomFichier || 'cv.pdf',
      dateUpload: new Date().toISOString(),
      scoreGeneral: Math.floor(Math.random() * 30) + 70,
      message: 'CV uploadé avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur upload CV' });
  }
});

app.get('/api/cvs/mes-cvs', async (req, res) => {
  try {
    res.json([
      { id: 1, nomFichier: 'CV_2025.pdf', dateUpload: '2025-01-15', scoreGeneral: 85, format: 'PDF' },
      { id: 2, nomFichier: 'CV_Stage.docx', dateUpload: '2025-02-10', scoreGeneral: 92, format: 'DOCX' }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération CVs' });
  }
});

app.delete('/api/cvs/:id', async (req, res) => {
  try {
    res.json({ message: 'CV supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression CV' });
  }
});

// ============================================
// Démarrer le serveur
// ============================================
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Serveur Node.js lancé sur http://localhost:${PORT}`);
});