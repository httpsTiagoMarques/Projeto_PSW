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

        // Inserir login em UserLog
        const log = "INSERT INTO UserLog (userId, acessoDateTime) VALUES (?, NOW())";
        conn.query(log, [user.id], function (errLog) {
            if (errLog) console.error("Erro ao gravar log:", errLog);
        });

        // sucesso — devolver dados mínimos
        res.json({ ok: true, message: "Login efetuado com sucesso.", nome: user.nome, userId: user.id });
        });
    });
    }

    /////////////////////////////
    /// GET - Desportos-Table ///
    /////////////////////////////
    function getDesportos(req, res) {
        const sql = `
            SELECT 
            d.id AS desportoId,
            d.nome AS nome,
            d.createdOn AS criadoEm,
            u.nome AS criadoPor
            FROM Desporto d
            INNER JOIN User u ON d.createdBy = u.id
            ORDER BY d.createdOn DESC
        `;

        conn.query(sql, function (err, rows) {
            if (err) {
            console.error("Erro ao obter desportos:", err);
            return res.status(500).json({ ok: false, message: "Erro ao obter dados da base de dados." });
            }

            res.json({
            ok: true,
            message: "Lista de desportos obtida com sucesso.",
            data: rows
            });
        });
    }

    //////////////////////////////
    /// DELETE - Desporto ///////
    //////////////////////////////
    function deleteDesporto(req, res) {
    const desportoId = req.params.id; // obtém o ID da rota

    if (!desportoId) {
        return res.status(400).json({ ok: false, message: "ID do desporto não fornecido." });
    }

    // Query para apagar o desporto pelo ID
    const sql = "DELETE FROM Desporto WHERE id = ?";

    conn.query(sql, [desportoId], function (err, result) {
        if (err) {
        console.error("Erro ao remover desporto:", err);
        return res.status(500).json({ ok: false, message: "Erro de base de dados ao remover desporto." });
        }

        // Se não encontrou linhas para apagar
        if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: "Desporto não encontrado." });
        }

        // Sucesso
        res.json({ ok: true, message: "Desporto removido com sucesso." });
    });
    }



    //////////////////////////////
    ////// GET - Statistics //////
    //////////////////////////////
    function getRankings(req, res) {
    // SQL: conta o número total de logins (UserLog) por cada utilizador (User)
    const sql = `
        SELECT 
            u.id AS userId,         
            u.nome AS nome,
            COUNT(l.id) AS totalLogins
        FROM User u
        LEFT JOIN UserLog l ON u.id = l.userId
        GROUP BY u.id, u.nome             
        ORDER BY totalLogins DESC
    `;

    // Executa a query na base de dados
    conn.query(sql, function (err, rows) {
        // Se der erro na base de dados, mostra no servidor e envia resposta de erro ao cliente
        if (err) {
            console.error("Erro ao obter estatísticas:", err);
            return res.status(500).json({ ok: false, message: "Erro de base de dados." });
        }

        // Se tudo correr bem, envia resposta JSON com os resultados
        res.json({
            ok: true,                           // indica que correu bem
            message: "Estatísticas obtidas com sucesso.",
            data: rows                          // contém a lista de utilizadores e respetivos logins
        });
    });
}



module.exports = { 
  registerUser,
  loginUser,
  getDesportos,
  deleteDesporto,
  getRankings
  
};