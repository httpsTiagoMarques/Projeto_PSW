"use strict";

const router = require("express").Router();
const passport = require("passport");
const mysql = require("mysql2");
const mysqlPool = require("../config/mysql.pool");
const bcrypt = require("bcrypt");

// LOGIN (autenticação com passport)
router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) return next(err);
    if (!user) return res.status(401).json(info || { message: "Erro de login." });

    req.login(user, function (err) {
      if (err) return next(err);

      // ✅ Regista login no histórico (UserLog)
      mysqlPool.query(
        "INSERT INTO UserLog (userId, acessoDateTime) VALUES (?, NOW())",
        [user.id],
        function (logErr) {
          if (logErr) console.error("Erro ao inserir UserLog:", logErr);
        }
      );

      res.json({ message: "Login efetuado com sucesso.", user });
    });
  })(req, res, next);
});


// SIGNUP (registo de novo utilizador)
router.post("/signup", function (req, res, next) {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password)
    return res.status(400).json({ message: "Faltam dados obrigatórios." });

  mysqlPool.query("SELECT id FROM User WHERE email = ?", [email], function (err, rows) {
    if (err) return next(err);
    if (rows.length)
      return res.status(409).json({ message: "O e-mail já está registado." });

    bcrypt.hash(password, 10, function (err, hash) {
      if (err) return next(err);

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

// LOGOUT
router.get("/logout", function (req, res) {
  req.logout(() => {
    res.json({ message: "Logout efetuado com sucesso." });
  });
});

// VERIFICAR SESSÃO
router.get("/verify", function (req, res) {
  if (req.user) {
    res.json({ message: "Utilizador autenticado.", user: req.user });
  } else {
    res.json({ message: "Nenhum utilizador autenticado." });
  }
});

module.exports = router;
