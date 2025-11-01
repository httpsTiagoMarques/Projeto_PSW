const express = require('express');
const router = express.Router();
const requestHandlers = require('../scripts/request-handlers.js');

// LOGIN com criação de sessão
router.post("/login", (req, res) => {
  // Criamos um "res wrapper" que mantém compatibilidade com o Express
  const safeRes = {
    status: (code) => {
      res.status(code);
      return safeRes; // permite encadeamento .json()
    },
    json: (data) => {
      // Se o login for bem-sucedido, criar sessão
      if (data.ok) {
        req.session.user = { id: data.userId, nome: data.nome };
        console.log("Sessão criada:", req.session.user);
      }
      res.json(data);
    }
  };

  // Chamamos a função original com o nosso wrapper
  requestHandlers.loginUser(req, safeRes);
});

// REGISTO normal
router.post("/register", requestHandlers.registerUser);

module.exports = router;
