
const express = require('express')
const jwt = require('jsonwebtoken')
const { json } = require('body-parser')

const router = express.Router()
const db = require('../database/connection_sqlite')
const userModel = require('../database/userModel')
const pointageModel = require('../database/pointageModel')
const middleware = require('../routes/middleware')


router.post('/status', (req, res) => {

    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(
        token.split(' ')[1],
        process.env.JWT_SECRET || 'dev_secret'
    );

    const now = new Date();

    userModel.getUserByUsername(decoded.username, (err, user) => {

        if (err) {
            return res.status(500).json({ message: 'Erreur DB' });
        }

        const newStatus = !user.status;

        userModel.updateUserStatus(user.username, newStatus, (err) => {

            if (err) {
                return res.status(500).json({ message: 'Erreur statut' });
            }

            pointageModel.updateLastPointage(user.id, now, (err) => {

                if (err) {
                    return res.status(500).json({ message: 'Erreur last pointage' });
                }

                // ENTRÉE
                if (newStatus === true) {

                    pointageModel.addPointage(user.id, (err) => {

                        if (err) {
                            return res.status(500).json({ message: 'Erreur entrée' });
                        }

                        return res.json({
                            success: true,
                            newStatus
                        });

                    });

                }

                // SORTIE
                else {

                    pointageModel.updatePointage(user.id, (err) => {

                        if (err) {
                            return res.status(500).json({ message: 'Erreur sortie' });
                        }

                        return res.json({
                            success: true,
                            newStatus
                        });

                    });

                }

            });

        });

    });

});

router.get('/:id', middleware.verifyAdmin, (req, res) => {
    db.get(
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

module.exports = router