const express = require('express');
const session = require('express-session');
const app = express();
const routers = require('./authentication/routes.js'); // <== Mantém o router
const requestHandlers = require('./scripts/request-handlers.js');

// =======================
// CONFIGURAÇÕES GERAIS
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('www'));

// =======================
// CONFIGURAÇÃO DE SESSÃO
// =======================
app.use(session({
  secret: "chave_super_secreta", // muda em produção!
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 30, // 30 minutos
    httpOnly: true,         // protege o cookie
    sameSite: "lax"
  }
}));

// =======================
// IMPEDIR CACHE DE PÁGINAS PROTEGIDAS
// =======================
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// =======================
// EJS
// =======================
app.set("view engine", "ejs");
app.set("views", "./views");

// =======================
// FUNÇÃO PARA VERIFICAR LOGIN
// =======================
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/index.html");
}

// =======================
// ROTAS DE AUTENTICAÇÃO (LOGIN/REGISTER)
// =======================
app.use("/api", routers);

// =======================
// LOGOUT
// =======================
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao terminar sessão:", err);
      return res.status(500).json({ ok: false, message: "Erro ao terminar sessão." });
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true, message: "Sessão terminada." });
  });
});

// =======================
// API PROTEGIDA
// =======================
app.get("/api/ranking", ensureAuthenticated, requestHandlers.getRankings);
app.get("/api/getDesportos", ensureAuthenticated, requestHandlers.getDesportos);
app.post("/api/desportos", ensureAuthenticated, requestHandlers.addDesporto);
app.put("/api/desportos/:id", ensureAuthenticated, requestHandlers.updateDesporto);
app.delete("/api/desportos/:id", ensureAuthenticated, requestHandlers.deleteDesporto);

// =======================
// PÁGINAS PROTEGIDAS
// =======================
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { nome: req.session.user.nome, userId: req.session.user.id });
});

app.get("/desportos", ensureAuthenticated, (req, res) => {
  res.render("desportos", { nome: req.session.user.nome, userId: req.session.user.id });
});

app.get("/ranking", ensureAuthenticated, (req, res) => {
  res.render("ranking", { nome: req.session.user.nome, userId: req.session.user.id });
});

// =======================
// ERRO GENÉRICO
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err });
});

// =======================
// START
// =======================
app.listen(8081, () => {
  console.log("✅ Server running at http://localhost:8081");
});
