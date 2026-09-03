const database = require('../config/db');
const Sequelize = require('sequelize');
const User = database.define('usuarios', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    nascimento: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    sexo: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},
)
module.exports = User;