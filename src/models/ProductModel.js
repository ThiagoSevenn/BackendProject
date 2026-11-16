const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Product extends Model {}

Product.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
},
  enable: { 
    type: DataTypes.BOOLEAN, 
    allowNull: true,
    defaultValue: 0 
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
  stock:{
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
},
  description:{
    type: DataTypes.STRING,
    allowNull: true
},
  price:{
    type: DataTypes.FLOAT,
    allowNull: false
},
  price_with_discount:{
    type: DataTypes.FLOAT,
    allowNull: false
},
  
}, { sequelize, modelName: 'Product', tableName: 'product' });

module.exports = Product;