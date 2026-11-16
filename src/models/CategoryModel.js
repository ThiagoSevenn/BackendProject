const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model {}

Category.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
},
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  slug: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  use_in_menu: { 
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: 0 
},
  
}, { sequelize, modelName: 'Category', tableName: 'category'});

module.exports = Category;