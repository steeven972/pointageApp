const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userModel = require('../database/userModel')
const middleware = require('../routes/middleware')
const { json } = require('body-parser')

router.post('/login', middleware.loginLimiter, (req, res) => {
    const { username, password } = req.body;

    userModel.getUserByUsername(username, async (err, user) => {
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


module.exports = router