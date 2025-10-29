const express = require('express');
const requestHandlers = require('./scripts/request-handlers.js');

const app = express();

// aceitar forms application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// (opcional) aceitar JSON, se precisares
app.use(express.json());

// servir ficheiros estáticos da pasta www
app.use(express.static('www'));

// ====== REST =======
// ===== REGISTO =====
app.post("/api/register", requestHandlers.registerUser);


// erro genérico
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err });
});

app.listen(8081, function () {
  console.log("Server running at http://localhost:8081");
});
