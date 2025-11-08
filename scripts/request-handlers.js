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

  // Executa a query na base de dados
  conn.query(sql, (err, rows) => {
    // Caso ocorra um erro durante a execução da query,
    // devolve uma resposta HTTP 500 (erro interno do servidor)
    if (err)
      return res
        .status(500)
        .json({ ok: false, message: "Erro ao obter desportos." });
    // Caso não haja erros, devolve os dados em formato JSON:
    res.json({ ok: true, message: "Lista obtida com sucesso.", data: rows });
  });
}

// =====================================
//  ADD DESPORTO (POST) - evita duplicados
// =====================================
function addDesporto(req, res) {
  // Obtém o nome do desporto a partir do corpo do pedido (req.body)
  // O trim() remove espaços em branco no início e fim
  const nome = (req.body.nome || "").trim();

  // Obtém o ID do utilizador autenticado (guardado na sessão através do Passport)
  const createdBy = req.user?.id;

  // Validação: verifica se o nome e o utilizador foram fornecidos
  if (!nome || !createdBy)
    return res
      .status(400) // Código 400 = pedido mal formulado
      .json({ ok: false, message: "Nome e utilizador são obrigatórios." });

  // ===============================
  // Verificação de duplicados
  // ===============================
  // Garante que não é inserido um desporto com o mesmo nome (case insensitive)
  conn.query(
    "SELECT id FROM Desporto WHERE LOWER(nome) = LOWER(?)",
    [nome],
    (err, rows) => {
      if (err)
        return res
          .status(500)// Código 500 = erro no servidor
          .json({ ok: false, message: "Erro de base de dados." });
      if (rows.length > 0)
        return res
          .status(409) // Se o nome já existir, retorna erro 409 (conflito)
          .json({ ok: false, message: "Já existe um desporto com esse nome." });

      // Se passou as verificações, insere o novo registo na tabela Desporto
      conn.query(
        "INSERT INTO Desporto (nome, createdOn, createdBy) VALUES (?, CURDATE(), ?)",
        [nome, createdBy],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ ok: false, message: "Erro ao adicionar desporto." });
          
          // Resposta de sucesso (201 = criado com sucesso)
          res.status(201).json({
            ok: true,
            message: "Desporto adicionado com sucesso.",
            desportoId: result.insertId, // Retorna o ID do novo desporto
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
  // Obtém o ID do desporto a atualizar, enviado como parâmetro na rota
  const desportoId = req.params.id;
  
  // Obtém e limpa o novo nome do desporto a partir do corpo do pedido
  const nome = (req.body.nome || "").trim();

  // Validação: se faltar o ID ou o nome, o pedido é inválido
  if (!desportoId || !nome)
    return res.status(400).json({ ok: false, message: "Dados inválidos." });

  // verifica duplicados
  conn.query(
    "SELECT id FROM Desporto WHERE LOWER(nome) = LOWER(?) AND id <> ?",
    [nome, desportoId],
    (err, rows) => {
      // Caso ocorra erro na consulta à base de dados
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro de base de dados." });
      // Se encontrar outro desporto com o mesmo nome, devolve erro 409 (conflito)
      if (rows.length > 0)
        return res.status(409).json({
          ok: false,
          message: "Já existe outro desporto com esse nome.",
        });

      // Caso não haja duplicados, procede à atualização do nome
      conn.query(
        "UPDATE Desporto SET nome = ? WHERE id = ?",
        [nome, desportoId],
        (err, result) => {
          // Se ocorrer erro durante a atualização
          if (err)
            return res
              .status(500)
              .json({ ok: false, message: "Erro ao atualizar desporto." });
          // Se nenhuma linha for afetada, o ID não existe (desporto não encontrado)
          if (result.affectedRows === 0)
            return res
              .status(404)
              .json({ ok: false, message: "Desporto não encontrado." });

          // Se tudo correr bem, devolve confirmação de sucesso
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

  // Verifica se existem sessões associadas a este desporto
  const sqlCheck = "SELECT COUNT(*) AS total FROM Sessao WHERE desportoId = ?";

  conn.query(sqlCheck, [desportoId], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ ok: false, message: "Erro ao verificar sessões associadas." });

    const totalSessoes = rows[0].total;

    // Se houver sessões registadas, impede a remoção
    if (totalSessoes > 0) {
      return res.status(409).json({
        ok: false,
        message:
          "Não é possível remover este desporto, pois existem sessões associadas.",
      });
    }

    // Caso contrário, elimina o desporto
    conn.query("DELETE FROM Desporto WHERE id = ?", [desportoId], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ ok: false, message: "Erro ao eliminar desporto." });
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ ok: false, message: "Desporto não encontrado." });

      res.json({ ok: true, message: "Desporto removido com sucesso." });
    });
  });
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
