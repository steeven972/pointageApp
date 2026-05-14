const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// chemin du fichier sqlite
const dbPath = path.join(__dirname, 'pointage.db');

// connexion / création de la DB
const connection = new sqlite3.Database(dbPath, (err) => {

    if (err) {
        console.error('Erreur connexion SQLite :', err.message);
        return;
    }

    console.log('Connecté à SQLite.');
});

// TABLE USERS
connection.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        tel TEXT,
        password TEXT NOT NULL,
        status INTEGER DEFAULT 0,
        role TEXT DEFAULT 'employé',
        last_pointage DATETIME
    )
`);

// TABLE POINTAGES
connection.run(`
    CREATE TABLE IF NOT EXISTS pointages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        timestamp_in DATETIME NOT NULL,
        timestamp_out DATETIME,
        total_minutes INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
`);


// 🔥 CREATION ADMIN AUTO
async function createAdmin() {

    const username = "admin";
    const password = "admin123";

    // vérifier si admin existe déjà
    connection.get(
        'SELECT id FROM users WHERE username = ?',
        [username],
        async (err, row) => {

            if (err) {
                console.error(err);
                return;
            }

            if (row) {
                console.log("Admin déjà existant");
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            connection.run(
                `
                INSERT INTO users (username, password, role, status)
                VALUES (?, ?, ?, ?)
                `,
                [username, hashedPassword, 'admin', 0],
                function(err) {

                    if (err) {
                        console.error("Erreur création admin :", err);
                        return;
                    }

                    console.log("Admin créé avec succès !");
                }
            );
        }
    );
}

createAdmin();

module.exports = { connection };