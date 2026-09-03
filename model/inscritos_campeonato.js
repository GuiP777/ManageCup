const database = require('../config/db');
const Sequelize = require('sequelize');
const Inscritos_Campeonato = database.define('inscritos_campeonato', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_campeonato: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'campeonatos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
module.exports = Inscritos_Campeonato;