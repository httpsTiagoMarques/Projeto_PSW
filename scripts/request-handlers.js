const conn = require("../config/mysql.pool"); // ligação à base de dados
const bcrypt = require("bcrypt"); // para cifrar passwords

    /////////////////////////////
    ///// POST - RegisterUser ///
    /////////////////////////////
    function registerUser(req, res) {
    // obter dados do formulário
    const nome = (req.body.nome || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    // validações básicas
    if (!nome || !email || !password)
        return res.status(400).json({ ok: false, message: "Preenche todos os campos." });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ ok: false, message: "Email inválido." });

    if (password.length < 6)
        return res.status(400).json({ ok: false, message: "Password demasiado curta." });

    // verificar se o email já existe
    conn.query("SELECT id FROM User WHERE email = ?", [email], function (err, rows) {
        if (err) return res.status(500).json({ ok: false, message: "Erro na base de dados." });
        if (rows.length > 0) return res.status(409).json({ ok: false, message: "Email já registado." });

        // cifrar password
        bcrypt.hash(password, 10, function (err, hash) {
        if (err) return res.status(500).json({ ok: false, message: "Erro ao cifrar password." });

        // inserir novo utilizador
        const sql = "INSERT INTO User (nome, email, password, createdOn) VALUES (?, ?, ?, CURDATE())";
        conn.query(sql, [nome, email, hash], function (err, result) {
            if (err) return res.status(500).json({ ok: false, message: "Erro ao registar utilizador." });

            // resposta de sucesso
            res.status(201).json({
            ok: true,
            message: "Utilizador registado com sucesso.",
            userId: result.insertId
            });
        });
        });
    });
    }

module.exports = { registerUser };
