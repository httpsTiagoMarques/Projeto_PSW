const express = require('express');
const session = require('express-session');
const passport = require('passport');

const passportMysql = require('./authentication/passport-mysql');
const authenticationRoutes = require('./authentication/routes');
const requestHandlers = require('./scripts/request-handlers.js');

const app = express();

// ============================
// Middleware Configuration
// ============================
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
    secret: 'xyngLynrRCHAwIZtQI3p189osMCZbdPHIj2Juh4X',
    resave: false,
    saveUninitialized: false
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passportMysql(passport);

// ============================
// Routes
// ============================
app.use('/authentication', authenticationRoutes);

// Static Files
app.use(express.static('www'));

// ============================
// Error Handling
// ============================
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

//User
//app.get("/User/:id", requestHandlers.getUserById);

// Desportos
app.get("/Desporto", requestHandlers.getAllDesportos);
//app.post("/Desporto", requestHandlers.postDesporto);
//app.put("/Desporto/:id", requestHandlers.putDesporto);
//app.delete("/Desporto/:id", requestHandlers.deleteDesporto);

//Sessao
//app.post("/Sessao", requestHandlers.postSessao);
//app.get("/Sessao/:id", requestHandlers.getAllSessaoByUser);
//app.put("/Sessao/:id", requestHandlers.putSessao);
//app.delete("/Sessao/:id", requestHandlers.deleteSessao);


// ============================
// Server escuta
// ============================
app.listen(8081, () => {
    console.log('✅ Server running at http://localhost:8081');
});
