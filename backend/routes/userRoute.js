const middleware = require('../routes/middleware')
const userModel = require('../database/userModel')
const pointageModel = require('../database/pointageModel')
const { json } = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()

router.get('/user/:id', middleware.verifyAdmin, (req, res) => {

    userModel.getUserById(req.params.id, (err, user) => {

        if(err){
            return res.status(500).json({ message: 'Erreur DB' });
        }

        if(!user){
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.json(user);
    });
});

// RÉCUPÉRER LES INFOS DE L'UTILISATEUR CONNECTÉ
router.get('/me', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'dev_secret');

    userModel.getUserByUsername(decoded.username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Erreur DB' });

        pointageModel.getOpenPointage(user.id, (err, openPointage) => {
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
        userModel.getUserByUsername(decoded.username, async (err, user) => {
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

            userModel.updatePassword(user.username, hashedPassword, (err) => {
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

router.post('/check-password', middleware.verifyAdmin, async (req, res) => {

    const { password } = req.body;

    userModel.getUserByUsername(req.user.username, async (err, user) => {

        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        res.json({
            success: isMatch
        });
    });
});

router.get('/:id', middleware.verifyAdmin, (req, res) => {

    userModel.getUserById(req.params.id, (err, user) => {

        if(err){
            return res.status(500).json({ message: 'Erreur DB' });
        }

        if(!user){
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.json(user);
    });
});


module.exports = router