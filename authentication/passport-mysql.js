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
        usernameField: "email", // Campo usado como "username" (email)
        passwordField: "password", // Campo da password no formulário
        passReqToCallback: true, // Permite aceder ao objeto req dentro da função callback
      },
      // Função executada quando um utilizador tenta fazer login
      function (req, email, password, done) {
        
        // Procura um utilizador com o email fornecido
        mysqlPool.query("SELECT * FROM User WHERE email = ?", [email], function (err, rows) {
          if (err) return done(err); // Erro na base de dados
          if (!rows.length) // Se não encontrar o utilizador
            return done(null, false, { message: "Utilizador não encontrado." });

          // Obtém o utilizador encontrado
          const user = rows[0];

          // Compara a password fornecida com a armazenada (encriptada)
          bcrypt.compare(password, user.password, function (err, match) {
            if (err) return done(err); // Erro na verificação
            // Se a password não corresponder, falha a autenticação
            if (!match) 
              return done(null, false, { message: "Password incorreta." });
            // Remove a password do objeto por segurança
            delete user.password;
            // Autenticação bem-sucedida — devolve o utilizador
            return done(null, user);
          });
        });
      }
    )
  );
};
