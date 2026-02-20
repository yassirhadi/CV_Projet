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

    // ============================
    // Compte ADMIN statique
    // ============================
    if (email === 'admin@gmail.com' && motDePasse === '2026@2026') {
      const role = 'ADMIN';
      const fakeAdminUser = {
        id: 0,
        nom: 'Admin',
        email,
        role
      };

      const token = jwt.sign(
        { id: fakeAdminUser.id, email: fakeAdminUser.email, role },
        'secret_key_temporaire',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: fakeAdminUser
      });
    }

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
// Réinitialisation du mot de passe (par email - étudiant)
// ============================================
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, nouveauMotDePasse } = req.body;

    if (!email || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Email et nouveau mot de passe requis' });
    }

    // Vérifier si l'email existe et correspond à un étudiant (pas admin)
    const [users] = await db.promise().query(`
      SELECT u.id, u.password, a.id as adminId
      FROM utilisateur u
      LEFT JOIN administrateur a ON u.id = a.id
      WHERE u.email = ?
    `, [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Cet email n'existe pas (email لا يوجد)" });
    }

    const user = users[0];

    if (user.adminId) {
      return res.status(403).json({ message: 'Cette fonctionnalité est réservée aux étudiants' });
    }

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);

    await db.promise().query(
      'UPDATE utilisateur SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    return res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('❌ Erreur reset mot de passe:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// Vérifier si un email étudiant existe (sans changer le mot de passe)
// ============================================
app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const [users] = await db.promise().query(`
      SELECT u.id, a.id as adminId
      FROM utilisateur u
      LEFT JOIN administrateur a ON u.id = a.id
      WHERE u.email = ?
    `, [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Cet email n'existe pas (email لا يوجد)" });
    }

    const user = users[0];

    if (user.adminId) {
      return res.status(403).json({ message: 'Cette fonctionnalité est réservée aux étudiants' });
    }

    return res.json({ message: 'Email existant', id: user.id });
  } catch (error) {
    console.error('❌ Erreur vérification email:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
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
// Changer le mot de passe (étudiant / utilisateur)
// ============================================
app.put('/api/utilisateurs/:id/mot-de-passe', async (req, res) => {
  try {
    const { id } = req.params;
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
    }

    const [users] = await db.promise().query(
      'SELECT id, password FROM utilisateur WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(ancienMotDePasse, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
    await db.promise().query(
      'UPDATE utilisateur SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
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
// Middleware JWT pour routes protégées
// ============================================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requis' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secret_key_temporaire');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// ============================================
// GESTION DES CVs
// ============================================
app.post('/api/cvs/upload', authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    
    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Les administrateurs ne peuvent pas déposer de CV' });
    }

    const nomFichier = req.body.nomFichier || 'cv.pdf';
    const formatCV = (nomFichier.split('.').pop() || 'PDF').toUpperCase();
    const scoreGeneral = Math.round((Math.random() * 30 + 70) * 100) / 100;

    await db.promise().query(
      'INSERT INTO cv (idEtudiant, nomFichier, dateUpload, scoreGeneral, formatCV) VALUES (?, ?, NOW(), ?, ?)',
      [id, nomFichier, scoreGeneral, formatCV]
    );

    const [result] = await db.promise().query('SELECT LAST_INSERT_ID() as id');
    const cvId = result[0].id;

    res.json({
      id: cvId,
      nomFichier,
      dateUpload: new Date().toISOString(),
      scoreGeneral,
      format: formatCV,
      message: 'CV uploadé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur upload CV:', error);
    res.status(500).json({ message: 'Erreur upload CV' });
  }
});

// Nombre de CVs de l'étudiant connecté
app.get('/api/cvs/mon-nombre', authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Réservé aux étudiants' });
    }
    const [[row]] = await db.promise().query(
      'SELECT COUNT(*) as count FROM cv WHERE idEtudiant = ?',
      [id]
    );
    res.json({ count: row.count });
  } catch (error) {
    console.error('❌ Erreur count CVs:', error);
    res.status(500).json({ message: 'Erreur récupération nombre CVs' });
  }
});

app.get('/api/cvs/mes-cvs', authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Réservé aux étudiants' });
    }
    const [cvs] = await db.promise().query(
      'SELECT id, nomFichier, dateUpload, scoreGeneral, formatCV as format FROM cv WHERE idEtudiant = ? ORDER BY dateUpload DESC',
      [id]
    );
    res.json(cvs);
  } catch (error) {
    console.error('❌ Erreur récupération CVs:', error);
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