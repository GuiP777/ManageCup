const database = require('../config/db');
const Sequelize = require('sequelize');
const Campeonatos = database.define('campeonatos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    esporte: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    inscricoes: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    organizador: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    localizacao: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    imagem: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},
)
module.exports = Campeonatos;