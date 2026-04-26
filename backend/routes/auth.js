const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const db = require('../database');
const jwt = require('jsonwebtoken');

// AJOUTER UN UTILISATEUR (ADMIN SEULEMENT)
router.post('/admin/create-user',verifyAdmin, async (req, res) => {
    const { username, password } = req.body;

    try {
        db.getUserByUsername(username, async (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur serveur' });
            }

            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.addUser(username, hashedPassword, 'employé', (err) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Erreur insertion DB'
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message: 'User registered successfully'
                    });
                }
            );
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur'
        });
    }
});

(async () => {
    const hash = await bcrypt.hash('admin123', 10);

    db.addUser('admin', hash, 'admin', (err) => {
        if (err) console.error(err);
        else console.log('Admin créé');
    });
})();

// LOGIN token generation 
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.getUserByUsername(username, async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                status: user.status
            },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '15m' }
        );
        

        return res.json({
            success: true,
            token
        });
    });
});

// POINTAGE (TOGGLER LE STATUT + ENREGISTRER LE POINTAGE)
router.post('/pointage/status', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(
        token.split(' ')[1],
        process.env.JWT_SECRET || 'dev_secret'
    );

    db.getUserByUsername(decoded.username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Erreur DB' });

        const newStatus = !user.status;
        db.updateUserStatus(user.username, newStatus, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur DB' });

            if (newStatus === true) {
            // 🔥 ENREGISTRER LE POINTAGE AVANT DE RÉPONDRE
            db.addPointage(user.id, (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Erreur pointage' });
                }

                return res.json({ success: true, newStatus });
            });
                
            }
            if (newStatus === false) {
                db.updatePointage(user.id, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Erreur pointage' });
                    }
                });

                return res.json({ success: true, newStatus });
            }
            
        });
    });
});

// RÉCUPÉRER LES INFOS DE L'UTILISATEUR CONNECTÉ
router.get('/me', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'Token manquant' });

    const decoded = jwt.verify(
        token.split(' ')[1],
        process.env.JWT_SECRET || 'dev_secret'
    );

    db.getUserByUsername(decoded.username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Erreur DB' });

        res.json({
            username: user.username,
            status: user.status
        });
    });
});

// ADMIN - RÉCUPÉRER TOUS LES UTILISATEURS + LEURS DERNIERS POINTAGES (POUR LE DASHBOARD ADMIN)
router.get('/users', verifyAdmin, (req, res) => {
    db.query(`
        SELECT id, username, status, last_pointage 
        FROM users
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        res.json(results);
    });
});

// ADMIN - RÉCUPÉRER TOUS LES POINTAGES D'UN UTILISATEUR
router.get('/pointages/:id', verifyAdmin, (req, res) => {
    db.query(
        'SELECT * FROM pointages WHERE user_id = ?',
        [req.params.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur DB' });
            }

            res.json(results);
        }
    );
});

// MEDDLEWARE POUR VERIFIER LE ROLE ADMIN
function verifyAdmin(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(
        token.split(' ')[1],
        process.env.JWT_SECRET || 'dev_secret'
    );

    if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
    }

    req.user = decoded;
    next();
}

module.exports = router;