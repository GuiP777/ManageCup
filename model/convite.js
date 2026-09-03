const database = require('../config/db');
const Sequelize = require('sequelize');
const Convite = database.define('convite', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    motivo: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    status: {
        type: Sequelize.STRING(25),
        allowNull: false,
    },
    id_equipe: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'equipes',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    id_jogador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'voleibol_jogador',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
},
)
module.exports = Convite;