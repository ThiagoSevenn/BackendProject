const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./ProductModel');

class ProductOption extends Model {}

ProductOption.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
},
  product_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {model: Product, key: 'id'}
},
  title: { 
    type: DataTypes.STRING,
    allowNull: false
},
  shape: { 
    type: DataTypes.ENUM('circle', 'square'), 
    allowNull: true,
    defaultValue: 'square'
},
  radius: { 
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 0
},
  type:{
    type: DataTypes.ENUM('text', 'color'),
    allowNull: true,
    defaultValue: 'text'
},
  values: { 
    type: DataTypes.STRING,
    allowNull: false
}}, { sequelize, modelName: 'ProductOption', tableName: 'product_option' });

module.exports = ProductOption;