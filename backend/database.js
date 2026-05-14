const db = require('mysql2');
const bcrypt = require('bcrypt');


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

connection.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL,tel VARCHAR(255), password VARCHAR(255) NOT NULL, status BOOLEAN DEFAULT false, role VARCHAR(255) NOT NULL DEFAULT "employé", last_pointage DATETIME)',
    (err, results) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
    console.log('Users table created or already exists.');
});
async function setupAdminTemp(){
    const username = "admin";
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "admin";

    connection.query('SELECT id FROM users WHERE username= ? LIMIT 1 ', [username],
        (err, results) =>{
            if(err){
                console.log(err);
                return;
            }
            if(results.length > 0){
                console.log("Admin existe déja !")
                return;
            }
            connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',[username, hashedPassword, role], 
                (err, results)=>{
                    if(err){
                        console.error("Error creating superadmin: " + err);
                    return;
                    }
                    console.log("Admin créé avec succès !")
                }
                
            )
        }
    ) 
    
}
setupAdminTemp()
connection.query('CREATE TABLE IF NOT EXISTS pointages (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, timestamp_in DATETIME NOT NULL, timestamp_out DATETIME, total_minutes INT, FOREIGN KEY (user_id) REFERENCES users(id))',
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

function getUserById(id, callback){
    connection.query(
        'SELECT id, username, status, role FROM users WHERE id = ?',
        [id],
        (err, results)=>{
            if(err) return callback(err);

            callback(null, results[0]);
        }
    );
}
function updateUserRole(userId, role, callback){
    connection.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId],
        (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        }
    );
}


function getUserList(callback){
    connection.query(`
        SELECT id, username, status, role, last_pointage 
        FROM users
    `, (err, results) => {
        if (err) {
            return callback(err);
        }

        callback(null, results);
    });
} 

function updatePassword(username, newPassword, callback) {
    connection.query(
        'UPDATE users SET password = ? WHERE username = ?',
        [newPassword, username],
        (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        }
    );
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

function addPointage(userId, callback) {
    
    connection.query('INSERT INTO pointages (user_id, timestamp_in, timestamp_out) VALUES (?, ?, ?)', [userId, new Date(), null], (err, results) => {
        if (err) {  
            console.error('Error adding pointage to database:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

function updatePointage(userId, callback) {
    const timestampOut = new Date();

    // 🔍 trouver le pointage ouvert
    connection.query(
        'SELECT * FROM pointages WHERE user_id = ? AND timestamp_out IS NULL LIMIT 1',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching pointage:', err);
                return callback(err);
            }

            if (results.length === 0) {
                return callback(new Error('Aucun pointage ouvert'));
            }

            const pointageId = results[0].id;
            const timestampIn = results[0].timestamp_in;
            const totalHours = (timestampOut - timestampIn) / (1000 * 60);
            
            updateLastPointage(userId, timestampIn)
            // 🔥 fermer le bon pointage
            connection.query(
                'UPDATE pointages SET timestamp_out = ?, total_minutes = ? WHERE id = ?',
                [timestampOut, totalHours, pointageId],
                (err, results) => {
                    if (err) {
                        console.error('Error updating pointage:', err);
                        return callback(err);
                    }
                    updateLastPointage(userId, timestampOut)
                    callback(null, results);
                }
            );
        }
    );
}

function addUser(username, hashedPassword, role, callback) {
    connection.query('INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)', [username, hashedPassword, role, false], (err, results) => {
        if (err) {  
            console.error('Error adding user to database:', err);
            return callback(err);
        }   
        callback(null, results);
    });
}
function deleteUser(userId, callback) {
    connection.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user from database:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

//FONCTION POUR RECUPERER LE POINTAGE OUVERT (SI EXISTE)
function getOpenPointage(userId, callback) {
    connection.query(
        'SELECT * FROM pointages WHERE user_id = ? AND timestamp_out IS NULL LIMIT 1',
        [userId],
        (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        }
    );
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

function getPointageTime(userId, callback) {

    connection.query(`
        SELECT 
            DATE(timestamp_in) AS date_jour,
            TIME(timestamp_in) AS entree,
            TIME(timestamp_out) AS sortie,
            TIMESTAMPDIFF(MINUTE, timestamp_in, timestamp_out) AS duree
        FROM pointages
        WHERE user_id = ?
        ORDER BY timestamp_in DESC
    `, [userId], callback);
}   

function updateLastPointage(userId,last_pointage, callback){
    connection.query('UPDATE users SET last_pointage= ? WHERE id = ?', [last_pointage,userId], (err, results) =>{

        if(callback){
            if (err){
            console.error('Error fetching db:' + err)
            callback(err)
            }
        callback(null, results)
        }
        

    } 
    )
}



module.exports = {connection, getUserByUsername, updateUserStatus,getUserStatus,
                addUser, addPointage, updatePointage, deleteUser, getOpenPointage,
                getUserList, updatePassword, getUserById, updateUserRole, getPointageTime, updateLastPointage};