const database = require('../config/db');
const Sequelize = require('sequelize');
const User_Corrida = database.define('usuario_corrida', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    recordePessoal: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    nivel: {
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
module.exports = User_Corrida;