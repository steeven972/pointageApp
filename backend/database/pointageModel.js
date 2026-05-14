const db = require('../database/connection_sqlite').connection;

// AJOUTER UN POINTAGE
function addPointage(userId, callback) {

    const now = new Date().toISOString();

    db.run(
        'INSERT INTO pointages (user_id, timestamp_in, timestamp_out) VALUES (?, ?, ?)',
        [userId, now, null],
        function(err) {

            if (err) {
                console.error('Error adding pointage:', err);
                return callback(err);
            }

            callback(null, {
                id: this.lastID
            });
        }
    );
}

// FERMER UN POINTAGE
function updatePointage(userId, callback) {

    const timestampOut = new Date();

    db.get(
        'SELECT * FROM pointages WHERE user_id = ? AND timestamp_out IS NULL LIMIT 1',
        [userId],
        (err, pointage) => {

            if (err) {
                console.error('Error fetching pointage:', err);
                return callback(err);
            }

            if (!pointage) {
                return callback(new Error('Aucun pointage ouvert'));
            }

            const timestampIn = new Date(pointage.timestamp_in);

            // durée en minutes
            const totalMinutes = Math.floor(
                (timestampOut - timestampIn) / (1000 * 60)
            );

            db.run(
                'UPDATE pointages SET timestamp_out = ?, total_minutes = ? WHERE id = ?',
                [
                    timestampOut.toISOString(),
                    totalMinutes,
                    pointage.id
                ],
                function(err) {

                    if (err) {
                        console.error('Error updating pointage:', err);
                        return callback(err);
                    }

                    updateLastPointage(
                        userId,
                        timestampOut.toISOString()
                    );

                    callback(null, {
                        updated: this.changes
                    });
                }
            );
        }
    );
}

// RÉCUPÉRER LE POINTAGE OUVERT
function getOpenPointage(userId, callback) {

    db.get(
        'SELECT * FROM pointages WHERE user_id = ? AND timestamp_out IS NULL LIMIT 1',
        [userId],
        (err, row) => {

            if (err) {
                return callback(err);
            }

            callback(null, row);
        }
    );
}

// HISTORIQUE DES POINTAGES
function getPointageTime(userId, callback) {

    db.all(
        `
        SELECT 
            DATE(timestamp_in) AS date_jour,
            TIME(timestamp_in) AS entree,
            TIME(timestamp_out) AS sortie,
            total_minutes AS duree
        FROM pointages
        WHERE user_id = ?
        ORDER BY timestamp_in DESC
        `,
        [userId],
        (err, rows) => {

            if (err) {
                return callback(err);
            }

            callback(null, rows);
        }
    );
}

// UPDATE LAST POINTAGE
function updateLastPointage(userId, last_pointage, callback = null) {

    db.run(
        'UPDATE users SET last_pointage = ? WHERE id = ?',
        [last_pointage, userId],
        function(err) {

            if (err) {

                console.error('Error updating last_pointage:', err);

                if (callback) {
                    return callback(err);
                }

                return;
            }

            if (callback) {
                callback(null, {
                    updated: this.changes
                });
            }
        }
    );
}

module.exports = {
    addPointage,
    updatePointage,
    getOpenPointage,
    getPointageTime,
    updateLastPointage
};