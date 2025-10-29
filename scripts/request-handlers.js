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

    /////////////////////////////
    //// Get - User to Login ////
    /////////////////////////////

    function loginUser(req, res) {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    // validações simples
    if (!email || !password)
        return res.status(400).json({ ok: false, message: "Preenche todos os campos." });

    // procurar utilizador pelo email
    const sql = "SELECT id, password, nome FROM User WHERE email = ?";
    conn.query(sql, [email], function (err, rows) {
        if (err) return res.status(500).json({ ok: false, message: "Erro de base de dados." });
        if (rows.length === 0) return res.status(401).json({ ok: false, message: "Credenciais inválidas." });

        const user = rows[0];

        // comparar password com bcrypt
        bcrypt.compare(password, user.password, function (err, match) {
        if (err) return res.status(500).json({ ok: false, message: "Erro ao verificar password." });
        if (!match) return res.status(401).json({ ok: false, message: "Credenciais inválidas." });

        // guardar login em UserLog
        const log = "INSERT INTO UserLog (userId, acessoDateTime) VALUES (?, NOW())";
        conn.query(log, [user.id], function (errLog) {
            if (errLog) console.error("Erro ao gravar log:", errLog);
        });

        // sucesso — devolver dados mínimos
        res.json({ ok: true, message: "Login efetuado com sucesso.", nome: user.nome, userId: user.id });
        });
    });
    }

module.exports = { registerUser,loginUser };
