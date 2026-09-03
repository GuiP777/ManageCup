const database = require('../config/db');
const Sequelize = require('sequelize');
const User_Boxe = database.define('usuario_boxe', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    apelido: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    peso: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    treinador: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    quantidadeLutas: {
        type: Sequelize.INTEGER,
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
module.exports = User_Boxe;