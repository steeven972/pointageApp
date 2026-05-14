const db = require('mysql2')
const path = require("path");
require('dotenv').config();


const connection = db.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }   
    console.log('Connected to the database.');
});

module.exports = {connection}

