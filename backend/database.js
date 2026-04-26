const db = require('mysql2');

const connection = db.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pointage_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }   
    console.log('Connected to the database.');
});

connection.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, last_pointage DATETIME)',
    (err, results) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
    console.log('Users table created or already exists.');
});

connection.query('CREATE TABLE IF NOT EXISTS pointages (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, status VARCHAR(255) NOT NULL, timestamp DATETIME NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))',
    (err, results) => {
        if (err) {
            console.error('Error creating pointages table:', err);
            return;
        }
        console.log('Pointages table created or already exists.');
    }
);

function getUserByUsername(username, callback) {
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user from database:', err);
            return callback(err);
        }
        callback(null, results[0]);
    });
}

function updateUserStatus(username, status, callback) {
    connection.query('UPDATE users SET status = ? WHERE username = ?', [status, username], (err, results) => {
        if (err) {
            console.error('Error updating user status:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

function addPointage(userId, status, callback) {
    
    connection.query('INSERT INTO pointages (user_id, status, timestamp) VALUES (?, ?, ?)', [userId, status, new Date()], (err, results) => {
        if (err) {  
            console.error('Error adding pointage to database:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

function addUser(username, hashedPassword, callback) {
    connection.query('INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)', [username, hashedPassword, 'employé' ,'absent'], (err, results) => {
        if (err) {  
            console.error('Error adding user to database:', err);
            return callback(err);
        }   
        callback(null, results);
    });
}

function getUserStatus(username, callback) {
    connection.query('SELECT status FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {  
            console.error('Error fetching user status from database:', err);
            return callback(err);
        }
        callback(null, results[0] ? results[0].status : null);
    });
}



module.exports = {connection, getUserByUsername, updateUserStatus,getUserStatus, addUser, addPointage};