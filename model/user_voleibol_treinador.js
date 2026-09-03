const database = require('../config/db');
const Sequelize = require('sequelize');
const User_Voleibol_Treinador = database.define('voleibol_treinador', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nomeEquipe: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    categoria: {
        type: Sequelize.STRING(50),
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

},
)
module.exports = User_Voleibol_Treinador;