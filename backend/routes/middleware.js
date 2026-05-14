const jwt = require('jsonwebtoken')
const rateLimit = require("express-rate-limit");
const { json } = require('body-parser')

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

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Trop de tentative. Réessayer dans 15 min"
    },
    standardHeaders:true,
    legacyHeaders: true
})

module.exports = {verifyAdmin, loginLimiter}