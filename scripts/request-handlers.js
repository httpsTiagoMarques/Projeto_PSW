const conn = require("../config/mysql.pool"); // ligação à base de dados
const bcrypt = require("bcrypt"); // para cifrar passwords

    // ======================
    // GET DESPORTOS (GET)
    // ======================
    function getDesportos(req, res) {
        const sql = `
            SELECT 
            d.id AS desportoId,
            d.nome AS nome,
            d.createdOn AS criadoEm,
            u.nome AS criadoPor
            FROM Desporto d
            INNER JOIN User u ON d.createdBy = u.id
            ORDER BY d.id ASC
        `;

        conn.query(sql, (err, rows) => {
            if (err)
            return res.status(500).json({ ok: false, message: "Erro ao obter desportos." });
            res.json({ ok: true, message: "Lista obtida com sucesso.", data: rows });
        });
    }

    // =====================================
    //  ADD DESPORTO (POST) - evita duplicados
    // =====================================
    function addDesporto(req, res) {
  const nome = (req.body.nome || "").trim();
  const createdBy = req.user?.id;

  if (!nome || !createdBy)
    return res.status(400).json({ ok: false, message: "Nome e utilizador são obrigatórios." });

  // verifica duplicados
  conn.query("SELECT id FROM Desporto WHERE LOWER(nome) = LOWER(?)", [nome], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, message: "Erro de base de dados." });
    if (rows.length > 0)
      return res.status(409).json({ ok: false, message: "Já existe um desporto com esse nome." });

    // insere novo desporto
    conn.query(
      "INSERT INTO Desporto (nome, createdOn, createdBy) VALUES (?, CURDATE(), ?)",
      [nome, createdBy],
      (err, result) => {
        if (err)
          return res.status(500).json({ ok: false, message: "Erro ao adicionar desporto." });
        res.status(201).json({ ok: true, message: "Desporto adicionado com sucesso.", desportoId: result.insertId });
      }
    );
  });
}


    // =====================================
    //  UPDATE DESPORTO (PUT) - evita duplicados
    // =====================================
    function updateDesporto(req, res) {
        const desportoId = req.params.id;
        const nome = (req.body.nome || "").trim();

        if (!desportoId || !nome)
            return res.status(400).json({ ok: false, message: "Dados inválidos." });

        // verifica duplicados
        conn.query(
            "SELECT id FROM Desporto WHERE LOWER(nome) = LOWER(?) AND id <> ?",
            [nome, desportoId],
            (err, rows) => {
            if (err) return res.status(500).json({ ok: false, message: "Erro de base de dados." });
            if (rows.length > 0)
                return res.status(409).json({ ok: false, message: "Já existe outro desporto com esse nome." });

            // atualiza nome
            conn.query("UPDATE Desporto SET nome = ? WHERE id = ?", [nome, desportoId], (err, result) => {
                if (err)
                return res.status(500).json({ ok: false, message: "Erro ao atualizar desporto." });
                if (result.affectedRows === 0)
                return res.status(404).json({ ok: false, message: "Desporto não encontrado." });

                res.json({ ok: true, message: "Desporto atualizado com sucesso." });
            });
            }
        );
    }

    // ========================
    // DELETE DESPORTO (DEL)
    // ========================
    function deleteDesporto(req, res) {
        const desportoId = req.params.id;
        if (!desportoId)
            return res.status(400).json({ ok: false, message: "ID não fornecido." });

        conn.query("DELETE FROM Desporto WHERE id = ?", [desportoId], (err, result) => {
            if (err)
            return res.status(500).json({ ok: false, message: "Erro ao eliminar desporto." });
            if (result.affectedRows === 0)
            return res.status(404).json({ ok: false, message: "Desporto não encontrado." });
            res.json({ ok: true, message: "Desporto removido com sucesso." });
        });
    }

    // ==========================
    // GET RANKINGS (GET)
    // ==========================
    function getRankings(req, res) {
        const sql = `
            SELECT 
            u.id AS userId, u.nome AS nome, COUNT(l.id) AS totalLogins
            FROM User u
            LEFT JOIN UserLog l ON u.id = l.userId
            GROUP BY u.id, u.nome
            ORDER BY totalLogins DESC
        `;

        conn.query(sql, (err, rows) => {
            if (err)
            return res.status(500).json({ ok: false, message: "Erro ao obter estatísticas." });
            res.json({ ok: true, message: "Estatísticas obtidas com sucesso.", data: rows });
        });
    }

    // ==========================
    // EXPORTAR FUNÇÕES
    // ==========================
    module.exports = {
    getDesportos,
    addDesporto,
    updateDesporto,
    deleteDesporto,
    getRankings
    };
