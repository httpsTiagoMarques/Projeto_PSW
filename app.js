"use strict";

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportMysql = require("./authentication/passport-mysql");
const authenticationRoutes = require("./authentication/routes");
const requestHandlers = require("./scripts/request-handlers");

const app = express();

// Configuração base
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("www"));

// Sessões
app.use(
  session({
    secret: "chave_super_secreta",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30, httpOnly: true, sameSite: "lax" },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());
passportMysql(passport);

// Bloquear cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware de autenticação
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/index.html");
}

// Rotas de autenticação
app.use("/authentication", authenticationRoutes);


// APIs protegidas
app.get("/api/getDesportos", ensureAuthenticated, requestHandlers.getDesportos);
app.post("/api/desportos", ensureAuthenticated, requestHandlers.addDesporto);
app.put("/api/desportos/:id", ensureAuthenticated, requestHandlers.updateDesporto);
app.delete("/api/desportos/:id", ensureAuthenticated, requestHandlers.deleteDesporto);
app.get("/api/ranking", ensureAuthenticated, requestHandlers.getRankings);

// Páginas EJS protegidas
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { nome: req.user.nome, userId: req.user.id });
});
app.get("/desportos", ensureAuthenticated, (req, res) => {
  res.render("desportos", { nome: req.user.nome, userId: req.user.id });
});
app.get("/ranking", ensureAuthenticated, (req, res) => {
  res.render("ranking", { nome: req.user.nome, userId: req.user.id });
});

// Erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err });
});

app.listen(8081, () => {
  console.log("✅ Server running at http://localhost:8081");
});
