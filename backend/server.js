const express = require('express');
const app = express();
const path = require('path');

const authRoutes = require('./routes/auth');

app.use(express.json());


app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.get('/pointage', (req, res) => {
    res.redirect('/pointage.html');
});

app.get('/dashboard', (req, res) => {
    res.redirect('/dashboard.html');
});

app.get('/admin', (req, res) => {
    res.redirect('/dashboard.html');
});
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;

// 👉 PAS BESOIN de sendFile ici
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});