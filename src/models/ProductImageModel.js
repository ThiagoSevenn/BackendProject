const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./ProductModel');

class ProductImage extends Model {}

ProductImage.init({
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
  enable: { 
    type: DataTypes.BOOLEAN, 
    allowNull: true,
    defaultValue: 0
},
  path: { 
    type: DataTypes.STRING,
    allowNull: false
}}, { sequelize, modelName: 'ProductImage', tableName: 'product_image' });

module.exports = ProductImage;