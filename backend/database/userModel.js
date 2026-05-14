const db = require('../database/connection_sqlite').connection;

// Récupérer un utilisateur par username
function getUserByUsername(username, callback) {

    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {

            if (err) {
                console.error('Error fetching user from database:', err);
                return callback(err);
            }

            callback(null, row);
        }
    );
}

// Récupérer user par ID
function getUserById(id, callback){

    db.get(
        'SELECT id, username, status, role FROM users WHERE id = ?',
        [id],
        (err, row) => {

            if(err){
                return callback(err);
            }

            callback(null, row);
        }
    );
}

// Modifier rôle
function updateUserRole(userId, role, callback){

    db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId],
        function(err){

            if(err){
                return callback(err);
            }

            callback(null, {
                changes: this.changes
            });
        }
    );
}

// Liste utilisateurs
function getUserList(callback){

    db.all(
        `SELECT id, username, status, role, last_pointage FROM users`,
        [],
        (err, rows) => {

            if(err){
                return callback(err);
            }

            callback(null, rows);
        }
    );
}

// Modifier mot de passe
function updatePassword(username, newPassword, callback){

    db.run(
        'UPDATE users SET password = ? WHERE username = ?',
        [newPassword, username],
        function(err){

            if(err){
                return callback(err);
            }

            callback(null, {
                changes: this.changes
            });
        }
    );
}

// Modifier statut
function updateUserStatus(username, status, callback){

    db.run(
        'UPDATE users SET status = ? WHERE username = ?',
        [status, username],
        function(err){

            if(err){
                console.error('Error updating user status:', err);
                return callback(err);
            }

            callback(null, {
                changes: this.changes
            });
        }
    );
}

// Ajouter utilisateur
function addUser(username, hashedPassword, role, callback){

    db.run(
        'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, role, false],
        function(err){

            if(err){
                console.error('Error adding user to database:', err);
                return callback(err);
            }

            callback(null, {
                id: this.lastID
            });
        }
    );
}

// Supprimer utilisateur
function deleteUser(userId, callback){

    db.run(
        'DELETE FROM users WHERE id = ?',
        [userId],
        function(err){

            if(err){
                console.error('Error deleting user from database:', err);
                return callback(err);
            }

            callback(null, {
                changes: this.changes
            });
        }
    );
}

// Récupérer statut utilisateur
function getUserStatus(username, callback){

    db.get(
        'SELECT status FROM users WHERE username = ?',
        [username],
        (err, row) => {

            if(err){
                console.error('Error fetching user status:', err);
                return callback(err);
            }

            callback(null, row ? row.status : null);
        }
    );
}

module.exports = {
    getUserById,
    getUserByUsername,
    updatePassword,
    updateUserRole,
    updateUserStatus,
    addUser,
    deleteUser,
    getUserStatus,
    getUserList
};