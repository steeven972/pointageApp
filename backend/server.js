const express = require('express');
const app = express();
const path = require('path');

const authRoute = require('./routes/auth')
const adminRoute = require('./routes/adminRoute')
const pointageRoute = require('./routes/pointageRoute')
const userRoute = require('./routes/userRoute')


app.use(express.json());


app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});


app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute)
app.use('/api/admin', adminRoute)
app.use('/api/user', userRoute);
app.use('/api/pointage', pointageRoute)


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});