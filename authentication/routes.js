const express = require('express');
const router = express.Router();
const requestHandlers = require('../scripts/request-handlers.js');

// Rotas de autenticação
router.post("/register", requestHandlers.registerUser);
router.post("/login", requestHandlers.loginUser);

module.exports = router;
