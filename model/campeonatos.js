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
    bracket_data: {
        type: Sequelize.TEXT('long'),
        allowNull: true
    },
    iniciado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    id_organizador: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
},
)
module.exports = Campeonatos;