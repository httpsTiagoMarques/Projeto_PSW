const express = require('express');
const requestHandlers = require('./scripts/request-handlers.js');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static('www'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err
    });
});

// ============================
// REST
// ============================

//User logs
app.get("/UserLog", requestHandlers.getUserLogs);

// Desportos
app.get("/Desporto", requestHandlers.getAllDesportos);


// ============================
// Server escuta
// ============================
app.listen(8081, () => {
    console.log('Server running at http://localhost:8081');
});
