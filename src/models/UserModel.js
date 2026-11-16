const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
},
  firstname: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  surname: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  email: { 
    type: DataTypes.STRING,
    allowNull: false 
},
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  
}, { sequelize, modelName: 'User', tableName: 'user' });

module.exports = User;