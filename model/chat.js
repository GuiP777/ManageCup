const database = require('../config/db');
const Sequelize = require('sequelize');
const Chat = database.define('chat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    lido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    creat_at: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    id_remetente: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
    },
    id_destinatario: {
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
module.exports = Chat;