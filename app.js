const express = require('express');
const app = express();
const routers = require('./authentication/routes.js');
const requestHandlers = require('./scripts/request-handlers.js');

// Middleware base
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('www'));

// EJS
app.set("view engine", "ejs");
app.set("views", "./views");


// API de estatísticas
app.get("/api/ranking", requestHandlers.getRankings);

// API de desportos
app.get("/api/getDesportos", requestHandlers.getDesportos);
app.post("/api/desportos", requestHandlers.addDesporto);
app.put("/api/desportos/:id", requestHandlers.updateDesporto);
app.delete("/api/desportos/:id", requestHandlers.deleteDesporto);

// Rotas de autenticação (registo/login)
app.use("/api", routers);

// Dashboard
app.get("/dashboard", (req, res) => {
  const nome = req.query.nome || "Utilizador";
  const userId = req.query.userId || 0;
  res.render("dashboard", { nome, userId });
});

// Pagina de desportos
app.get("/desportos", (req, res) => {
  const nome = req.query.nome || "Utilizador";
  const userId = req.query.userId || 0;
  res.render("desportos", { nome, userId });
});

// Página de ranking
app.get("/ranking", (req, res) => {
  const nome = req.query.nome || "Utilizador";
  const userId = req.query.userId || 0;
  res.render("ranking", { nome, userId });
});



// Erro genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err });
});

app.listen(8081, () => {
  console.log("Server running at http://localhost:8081");
});
