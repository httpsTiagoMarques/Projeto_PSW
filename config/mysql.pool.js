"use strict";

//Importar o módulo mysql
const mysql = require('mysql2');
//Inicializar a 'pool' com os detalhes da nossa conexão.
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'PSW_Projeto',
});

//Exportar a pool para ser utilizada por outros módulos.
module.exports = pool;