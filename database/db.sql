-- Criar a base de dados
CREATE DATABASE IF NOT EXISTS PSW_Projeto;

USE PSW_Projeto;

-- Criar tabela User
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdOn DATE NOT NULL
);

-- Criar tabela UserLog
CREATE TABLE UserLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    acessoDateTime DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User (id)
);

-- Criar tabela Desporto
CREATE TABLE Desporto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    createdOn DATE NOT NULL,
    createdBy INT NOT NULL,
    FOREIGN KEY (createdBy) REFERENCES User (id)
);

-- Criar tabela Sessao
CREATE TABLE Sessao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    desportoId INT NOT NULL,
    duracao INT NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User (id),
    FOREIGN KEY (desportoId) REFERENCES Desporto (id)
);