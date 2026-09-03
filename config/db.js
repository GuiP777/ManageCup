const Sequelize = require('sequelize');
const sequelize = new Sequelize('managecup', 'root', '', {dialect: 'mysql', host: 'localhost',
query:{raw:true}, define:{timestamps: false, freezeTableName: true,}});
module.exports = sequelize;