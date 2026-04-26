const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const db = require('../database');
const jwt = require('jsonwebtoken');


router.post('/register', async (req, res) => {
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

            db.addUser(username, hashedPassword, (err) => {
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
            { expiresIn: '1h' }
        );

        return res.json({
            success: true,
            token
        });
    });
});

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

// ⏱️ récupérer pointages d’un user
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

        const newStatus = user.status === 'présent' ? 'absent' : 'présent';

        db.updateUserStatus(user.username, newStatus, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur DB' });

            // 🔥 ENREGISTRER LE POINTAGE AVANT DE RÉPONDRE
            db.addPointage(user.id, newStatus, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erreur pointage' });
                }

                res.json({ success: true, newStatus });
            });
        });
    });
});

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