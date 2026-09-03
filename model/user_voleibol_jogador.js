const database = require('../config/db');
const Sequelize = require('sequelize');
const User_Voleibol_Jogador = database.define('voleibol_jogador', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    posicao: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    tamanho: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    tempo: {
        type: Sequelize.STRING(25),
        allowNull: false,
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    id_equipe: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'equipes',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },


},
)
module.exports = User_Voleibol_Jogador;