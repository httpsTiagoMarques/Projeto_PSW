const conn = require("../config/mysql.pool");

const getUserLogs = (req, res) => {
    const query = `
        SELECT u.id AS userId, u.nome, COUNT(uL.id) AS totalLogs
        FROM User u
        LEFT JOIN UserLog uL ON u.id = uL.userId
        GROUP BY u.id, u.nome;`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ message: "Database query error", error: err });
            return;
        }
        res.json(results);
    });
};

const getAllDesportos = (req, res) => {
    const query = `SELECT * FROM Desporto`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ message: "Database query error", error: err });
            return;
        }
        res.json(results);
    });
};

module.exports = { getUserLogs, getAllDesportos };
