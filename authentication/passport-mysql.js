"use strict";

const LocalStrategy = require("passport-local").Strategy;
const mysqlPool = require("../config/mysql.pool");
const bcrypt = require("bcrypt");

module.exports = function (passport) {
  // Guardar apenas o id do utilizador na sessão
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Recarregar o utilizador da BD com base no id guardado
  passport.deserializeUser(function (id, done) {
    mysqlPool.query("SELECT id, nome, email FROM User WHERE id = ?", [id], function (err, rows) {
      if (err) return done(err);
      done(null, rows[0]);
    });
  });

  // Estratégia de login local
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        mysqlPool.query("SELECT * FROM User WHERE email = ?", [email], function (err, rows) {
          if (err) return done(err);
          if (!rows.length) return done(null, false, { message: "Utilizador não encontrado." });

          const user = rows[0];
          bcrypt.compare(password, user.password, function (err, match) {
            if (err) return done(err);
            if (!match) return done(null, false, { message: "Password incorreta." });
            delete user.password;
            return done(null, user);
          });
        });
      }
    )
  );
};
