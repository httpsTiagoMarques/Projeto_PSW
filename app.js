const express = require('express');
const requestHandlers = require('./scripts/request-handlers.js');

const app = express();

// aceitar forms application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// (opcional) aceitar JSON, se precisares
app.use(express.json());

// servir ficheiros estáticos da pasta www
app.use(express.static('www'));

app.set("view engine", "ejs");
app.set("views", "./views");

// ====== REST =======
// ===== REGISTO =====
app.post("/api/register", requestHandlers.registerUser);

// ===== LOGIN =====
app.post("/api/login", requestHandlers.loginUser);

// ===== Dashboard =====
app.get("/dashboard", function (req, res) {
  // obtém dados do utilizador enviados via query string ou sessão
  const nome = req.query.nome || "Utilizador";
  const userId = req.query.userId || 0;
  res.render("dashboard", { nome, userId });
});

// erro genérico
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err });
});

app.listen(8081, function () {
  console.log("Server running at http://localhost:8081");
});
