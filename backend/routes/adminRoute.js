const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const { json } = require('body-parser')

const bcrypt = require('bcrypt')

const userModel = require('../database/userModel');
const pointageModel = require('../database/pointageModel')

const middleware = require('../routes/middleware')

router.post('/create-user',middleware.verifyAdmin, async (req, res) => {
    const { username, password, role } = req.body;

    let finalRole =  'employé';

    if (role === 'admin' && req.user.role !== 'admin') {
        finalRole = 'admin';
    }

    try {
        userModel.getUserByUsername(username, async (err, user) => {
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

            userModel.addUser(username, hashedPassword, role, (err) => {
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

router.post('/delete-user', middleware.verifyAdmin, (req, res) => {
    const { userId } = req.body;
    userModel.deleteUser(userId, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        return res.json({ success: true, message: 'User deleted successfully' });
    });
});

router.get('/create-user', middleware.verifyAdmin, (req, res) => {
    res.sendFile('register.html', '../frontend/register.html');
});

// ADMIN - RÉCUPÉRER TOUS LES UTILISATEURS + LEURS DERNIERS POINTAGES (POUR LE DASHBOARD ADMIN)
router.get('/users', middleware.verifyAdmin, (req, res) => {
    userModel.getUserList((err, users) =>{
        if (err) return res.status(500).json({ message: 'Erreur DB'});
        users.forEach(user=> {
            
        });
        res.json(users);
    })
});

router.post('/update-role', middleware.verifyAdmin, (req, res) => {

    const { userId, role } = req.body;

    if (!['admin', 'employé'].includes(role)) {
        return res.status(400).json({
            message: "Rôle invalide"
        });
    }

    userModel.updateUserRole(userId, role, (err) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur DB"
            });
        }
        if(req.user.id == userId){
            return res.json({message:"Impossible"});
        }

        res.json({
            success: true

        });
    });
});


router.post('/get-pointage', middleware.verifyAdmin, (req, res) => {

    const { userId } = req.body;

    pointageModel.getPointageTime(userId, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Erreur DB"
            });
        }

        res.json({
            success: true,
            pointages: results
        });

    });

});

router.post('/update-role', middleware.verifyAdmin, (req, res) => {

    const { userId, role } = req.body;

    if (!['admin', 'employé'].includes(role)) {
        return res.status(400).json({
            message: "Rôle invalide"
        });
    }

    userModel.updateUserRole(userId, role, (err) => {
        if (err) {
            return res.status(500).json({
                message: "Erreur DB"
            });
        }
        if(req.user.id == userId){
            return res.json({message:"Impossible"});
        }

        res.json({
            success: true

        });
    });
});

module.exports = router