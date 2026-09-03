const database = require('../config/db');
const Sequelize = require('sequelize');
const Postagem_Comentarios = database.define('postagem_comentarios', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    resposta: {
        type: Sequelize.TEXT,
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
    id_postagem: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'postagem',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
    },
},
)
module.exports = Postagem_Comentarios;