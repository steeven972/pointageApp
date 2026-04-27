const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const db = require('../database');
const jwt = require('jsonwebtoken');

// AJOUTER UN UTILISATEUR (ADMIN SEULEMENT)
router.post('/admin/create-user',verifyAdmin, async (req, res) => {
    const { username, password, role } = req.body;

    let finalRole =  'employé';

    if (role === 'admin' && req.user.role !== 'admin') {
        finalRole = 'admin';
    }

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

            db.addUser(username, hashedPassword, role, (err) => {
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

router.post('/admin/delete-user', verifyAdmin, (req, res) => {
    const { userId } = req.body;
    db.deleteUser(userId, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        return res.json({ success: true, message: 'User deleted successfully' });
    });
});

router.get('/admin/create-user', verifyAdmin, (req, res) => {
    res.sendFile('register.html', '../frontend/register.html');
});

// ADMIN - RÉCUPÉRER TOUS LES UTILISATEURS + LEURS DERNIERS POINTAGES (POUR LE DASHBOARD ADMIN)
router.get('/admin/users', verifyAdmin, (req, res) => {
    db.getUserList((err, users) =>{
        if (err) return res.status(500).json({ message: 'Erreur DB'});
        res.json(users);
    })
});

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
            { expiresIn: '1h' }
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

            db.getOpenPointage(user.id, (err, openPointage) =>{
                // 🔥 ENREGISTRER LE POINTAGE AVANT DE RÉPONDRE
                if(!openPointage){
                    db.addPointage(user.id, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Erreur pointage' });
                    }

                    return res.json({ success: true, newStatus });
                    });
                }else{
                     db.updatePointage(user.id, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Erreur pointage' });
                    }
                    return res.json({ success: true, newStatus });
                });
                }
                
            })
             
            
                
        });
    });
});


// RÉCUPÉRER LES INFOS DE L'UTILISATEUR CONNECTÉ
router.get('/me', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'dev_secret');

    db.getUserByUsername(decoded.username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Erreur DB' });

        db.getOpenPointage(user.id, (err, openPointage) => {
            if (err) return res.status(500).json({ message: 'Erreur DB' });

            res.json({
                username: user.username,
                status: !!openPointage
            });
        });
    });
});

router.post('/update-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(
            token.split(' ')[1],
            process.env.JWT_SECRET || 'dev_secret'
        );

        // 🔥 récupérer le user en DB
        db.getUserByUsername(decoded.username, async (err, user) => {
            if (err) return res.status(500).json({ message: 'Erreur DB' });

            // 🔥 comparer avec le vrai password hash
            const isMatch = await bcrypt.compare(oldPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect'
                });
            }

            // 🔥 hash du nouveau password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            db.updatePassword(user.username, hashedPassword, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erreur DB' });
                }

                return res.json({
                    success: true,
                    message: 'Mot de passe mis à jour'
                });
            });
        });

    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
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

router.get('/user/:id', verifyAdmin, (req, res) => {

    db.getUserById(req.params.id, (err, user) => {

        if(err){
            return res.status(500).json({ message: 'Erreur DB' });
        }

        if(!user){
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.json(user);
    });
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