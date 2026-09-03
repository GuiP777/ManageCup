const database = require('../config/db');
const Sequelize = require('sequelize');
const Postagem = database.define('postagem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    esporte: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    creat_at: {
        type: Sequelize.TIME,
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
module.exports = Postagem;