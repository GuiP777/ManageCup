const database = require('../config/db');
const Sequelize = require('sequelize');
const Equipes = database.define('equipes', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_treinador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'voleibol_treinador',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
},
)
module.exports = Equipes;