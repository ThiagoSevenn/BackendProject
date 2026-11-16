require('dotenv').config();
const { Sequelize } = require('sequelize');

// Conexão com o banco de dados MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;