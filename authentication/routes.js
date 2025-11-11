"use strict";

// Importação de módulos necessários
const router = require("express").Router();
const passport = require("passport");
const mysql = require("mysql2");
const mysqlPool = require("../config/mysql.pool");
const bcrypt = require("bcrypt");

// ============================================================
// LOGIN (autenticação de utilizador com Passport.js)
// ============================================================
// Esta rota é responsável por autenticar o utilizador com base nas credenciais fornecidas (email e password)
// Se a autenticação for bem-sucedida, cria uma sessão e regista o login na tabela UserLog.
router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) return next(err); // Erro interno do Passport
    if (!user) return res.status(401).json(info || { message: "Erro de login." });

    // Inicia sessão para o utilizador autenticado
    req.login(user, function (err) {
      if (err) return next(err);

      // Regista o login do utilizador na tabela UserLog (histórico de acessos)
      mysqlPool.query(
        "INSERT INTO UserLog (userId, acessoDateTime) VALUES (?, NOW())",
        [user.id],
        function (logErr) {
          if (logErr) console.error("Erro ao inserir UserLog:", logErr);
        }
      );

      // Resposta em caso de sucesso
      res.json({ message: "Login efetuado com sucesso.", user });
    });
  })(req, res, next); // Invoca a função de autenticação
});


// ======================================================
// SIGNUP (registo de novo utilizador)
// ======================================================
// Regista um novo utilizador na base de dados, verificando primeiro se o email já existe.
// A password é encriptada com bcrypt antes de ser guardada.
router.post("/signup", function (req, res, next) {
  const { nome, email, password } = req.body;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!nome || !email || !password)
    return res.status(400).json({ message: "Faltam dados obrigatórios." });

  // Verifica se já existe um utilizador com o mesmo email
  mysqlPool.query("SELECT id FROM User WHERE email = ?", [email], function (err, rows) {
    if (err) return next(err);
    if (rows.length)
      return res.status(409).json({ message: "O e-mail já está registado." });

    // Encripta a password antes de armazenar
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) return next(err);

      // Insere o novo utilizador na base de dados
      mysqlPool.query(
        "INSERT INTO User (nome, email, password, createdOn) VALUES (?, ?, ?, CURDATE())",
        [nome, email, hash],
        function (err, result) {
          if (err) return next(err);
          res.json({
            message: "Utilizador registado com sucesso.",
            user: { id: result.insertId, email },
          });
        }
      );
    });
  });
});

// ======================================================
// LOGOUT (terminar sessão do utilizador)
// ======================================================
// Encerra a sessão ativa e devolve uma mensagem de confirmação.
router.get("/logout", function (req, res) {
  req.logout(() => {
    res.json({ message: "Logout efetuado com sucesso." });
  });
});

// ======================================================
// VERIFICAR SESSÃO ATIVA
// ======================================================
// Verifica se existe um utilizador autenticado na sessão atual.
// Útil para validar se o utilizador ainda está logado no cliente.
router.get("/verify", function (req, res) {
  if (req.user) {
    res.json({ message: "Utilizador autenticado.", user: req.user });
  } else {
    res.json({ message: "Nenhum utilizador autenticado." });
  }
});

// Exporta o router para ser utilizado no servidor principal
module.exports = router;
