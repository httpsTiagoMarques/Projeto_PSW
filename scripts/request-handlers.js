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
      return res
        .status(500)
        .json({ ok: false, message: "Erro ao obter desportos." });
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
    return res
      .status(400)
      .json({ ok: false, message: "Nome e utilizador são obrigatórios." });

  // verifica duplicados
  conn.query(
    "SELECT id FROM Desporto WHERE LOWER(nome) = LOWER(?)",
    [nome],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro de base de dados." });
      if (rows.length > 0)
        return res
          .status(409)
          .json({ ok: false, message: "Já existe um desporto com esse nome." });

      // insere novo desporto
      conn.query(
        "INSERT INTO Desporto (nome, createdOn, createdBy) VALUES (?, CURDATE(), ?)",
        [nome, createdBy],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ ok: false, message: "Erro ao adicionar desporto." });
          res.status(201).json({
            ok: true,
            message: "Desporto adicionado com sucesso.",
            desportoId: result.insertId,
          });
        }
      );
    }
  );
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
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro de base de dados." });
      if (rows.length > 0)
        return res.status(409).json({
          ok: false,
          message: "Já existe outro desporto com esse nome.",
        });

      // atualiza nome
      conn.query(
        "UPDATE Desporto SET nome = ? WHERE id = ?",
        [nome, desportoId],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ ok: false, message: "Erro ao atualizar desporto." });
          if (result.affectedRows === 0)
            return res
              .status(404)
              .json({ ok: false, message: "Desporto não encontrado." });

          res.json({ ok: true, message: "Desporto atualizado com sucesso." });
        }
      );
    }
  );
}

// =====================================
//  UPDATE TREINO (PUT)
// =====================================
function updateSessao(req, res) {
  const sessaoId = req.params.id;
  const { desportoId, duracao, localizacao, data, hora } = req.body;

  if (!sessaoId || !desportoId || !duracao || !localizacao || !data || !hora)
    return res.status(400).json({ ok: false, message: "Dados inválidos." });

  const sql = `
    UPDATE Sessao
    SET desportoId = ?, duracao = ?, localizacao = ?, data = ?, hora = ?
    WHERE id = ?
  `;

  conn.query(
    sql,
    [desportoId, duracao, localizacao, data, hora, sessaoId],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro ao atualizar sessão." });
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ ok: false, message: "Sessão não encontrada." });

      res.json({ ok: true, message: "Sessão atualizada com sucesso." });
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

  conn.query(
    "DELETE FROM Desporto WHERE id = ?",
    [desportoId],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro ao eliminar desporto." });
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ ok: false, message: "Desporto não encontrado." });
      res.json({ ok: true, message: "Desporto removido com sucesso." });
    }
  );
}

// =====================================
//  DELETE TREINO (DELETE)
// =====================================
function deleteSessao(req, res) {
  const sessaoId = req.params.id;

  if (!sessaoId)
    return res
      .status(400)
      .json({ ok: false, message: "ID da sessão não fornecido." });

  conn.query("DELETE FROM Sessao WHERE id = ?", [sessaoId], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ ok: false, message: "Erro ao eliminar sessão." });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ ok: false, message: "Sessão não encontrada." });

    res.json({ ok: true, message: "Sessão removida com sucesso." });
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
      return res
        .status(500)
        .json({ ok: false, message: "Erro ao obter estatísticas." });
    res.json({
      ok: true,
      message: "Estatísticas obtidas com sucesso.",
      data: rows,
    });
  });
}

// ================================
// GET SESSÕES (LISTAR) - do utilizador logado
// ================================
function getSessoes(req, res) {
  const userId = req.user?.id;
  if (!userId)
    return res
      .status(401)
      .json({ ok: false, message: "Utilizador não autenticado." });

  const sql = `
            SELECT 
                s.id AS sessaoId,
                d.nome AS desporto,
                s.duracao,
                s.localizacao,
                s.data,
                s.hora
            FROM Sessao s
            INNER JOIN Desporto d ON s.desportoId = d.id
            WHERE s.userId = ?
            ORDER BY s.data DESC, s.hora DESC
        `;

  conn.query(sql, [userId], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ ok: false, message: "Erro ao obter sessões." });
    res.json({
      ok: true,
      message: "Lista de sessões obtida com sucesso.",
      data: rows,
    });
  });
}

// ======================================
// ADD SESSÃO (POST) - registar novo treino
// ======================================
function addSessao(req, res) {
  const userId = req.user?.id;
  const { desportoId, duracao, localizacao, data, hora } = req.body;

  if (!userId)
    return res
      .status(401)
      .json({ ok: false, message: "Utilizador não autenticado." });

  if (!desportoId || !duracao || !localizacao || !data || !hora)
    return res
      .status(400)
      .json({ ok: false, message: "Todos os campos são obrigatórios." });

  const sql = `
            INSERT INTO Sessao (userId, desportoId, duracao, localizacao, data, hora)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

  conn.query(
    sql,
    [userId, desportoId, duracao, localizacao, data, hora],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro ao registar a sessão." });

      res.status(201).json({
        ok: true,
        message: "Sessão registada com sucesso.",
        sessaoId: result.insertId,
      });
    }
  );
}

 // ==============================
    // GET ESTATÍSTICAS DO UTILIZADOR
    // ==============================
    function getEstatisticas(req, res) {
        // Obtém o ID do utilizador autenticado (guardado na sessão pelo Passport)
        const userId = req.user?.id;

        // Se não houver utilizador autenticado, devolve erro 401 (não autorizado)
        if (!userId)
            return res.status(401).json({ ok: false, message: "Utilizador não autenticado." });

        // ===== Número total de sessões =====
        const sqlTotal = "SELECT COUNT(*) AS totalSessoes FROM Sessao WHERE userId = ?";

        // ===== Tempo total de todas as sessões =====
        // COALESCE garante que, se não houver resultados, retorna 0 em vez de NULL
        const sqlTempo = "SELECT COALESCE(SUM(duracao),0) AS tempoTotal FROM Sessao WHERE userId = ?";

        // ===== Desporto favorito =====
        // Seleciona o nome do desporto que aparece mais vezes nas sessões do utilizador
        const sqlFav = `
            SELECT d.nome AS desportoFavorito
            FROM Sessao s
            INNER JOIN Desporto d ON s.desportoId = d.id
            WHERE s.userId = ?
            GROUP BY d.id
            ORDER BY COUNT(s.id) DESC
            LIMIT 1
        `;

        // Executa a primeira query (total de sessões)
        conn.query(sqlTotal, [userId], (err1, rows1) => {
            if (err1)
                return res.status(500).json({ ok: false, message: "Erro ao obter total de sessões." });

            // Executa a segunda query (tempo total)
            conn.query(sqlTempo, [userId], (err2, rows2) => {
                if (err2)
                    return res.status(500).json({ ok: false, message: "Erro ao obter tempo total." });

                // Executa a terceira query (desporto favorito)
                conn.query(sqlFav, [userId], (err3, rows3) => {
                    if (err3)
                        return res.status(500).json({ ok: false, message: "Erro ao obter desporto favorito." });

                    // Envia resposta JSON consolidando os três resultados
                    res.json({
                        ok: true,
                        totalSessoes: rows1[0].totalSessoes,           // Número total de sessões
                        tempoTotal: rows2[0].tempoTotal,               // Soma das durações
                        desportoFavorito: rows3[0]?.desportoFavorito || "Nenhum" // Nome do desporto mais praticado
                    });
                });
            });
        });
    }

    // ===================================
  // GET ESTATÍSTICAS POR DESPORTO (UTILIZADOR ATUAL)
  // ===================================
  function getEstatisticasPorDesporto(req, res) {
    // Obtém o ID do utilizador autenticado através da sessão (passport)
    const userId = req.user?.id;

    // Se o utilizador não estiver autenticado, devolve erro 401 (não autorizado)
    if (!userId)
      return res.status(401).json({ ok: false, message: "Utilizador não autenticado." });

    // Query SQL:
    // - Junta as tabelas Sessao e Desporto
    // - Conta o número total de sessões por desporto (COUNT)
    // - Soma a duração total de todas as sessões desse desporto (SUM)
    // - Agrupa por ID e nome do desporto
    // - Ordena do desporto com mais sessões para o com menos
    const sql = `
      SELECT 
        d.nome AS desporto,
        COUNT(s.id) AS totalSessoes,
        COALESCE(SUM(s.duracao), 0) AS tempoTotal
      FROM Sessao s
      INNER JOIN Desporto d ON s.desportoId = d.id
      WHERE s.userId = ?
      GROUP BY d.id, d.nome
      ORDER BY totalSessoes DESC
    `;

    // Executa a query, substituindo o "?" pelo ID do utilizador atual
    conn.query(sql, [userId], (err, rows) => {
      // Se ocorrer erro na base de dados, devolve resposta 500
      if (err)
        return res.status(500).json({ ok: false, message: "Erro ao obter estatísticas por desporto." });

      // Caso tudo corra bem, devolve o resultado em formato JSON
      res.json({
        ok: true,
        message: "Estatísticas por desporto obtidas com sucesso.",
        data: rows // Contém um array de objetos: { desporto, totalSessoes, tempoTotal }
      });
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
  getRankings,
  getSessoes,
  addSessao,
  updateSessao,
  deleteSessao,
  getEstatisticas,
  getEstatisticasPorDesporto
};
