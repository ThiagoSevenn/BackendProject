const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./ProductModel');
const Category = require('./CategoryModel');

class ProductCategory extends Model {}

ProductCategory.init({
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
  category_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {model: Category, key: 'id'}
}}, { sequelize, modelName: 'ProductCategory', tableName: 'product_category' });

module.exports = ProductCategory;